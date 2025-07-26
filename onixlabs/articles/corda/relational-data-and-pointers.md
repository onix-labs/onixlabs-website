# Relational Data & Pointers

In this article we are going to look at state pointers in Corda, understanding what they are, how to use them, and finally how we can think of state pointers as a design pattern, rather than APIs belonging solely to the Corda SDK.

## Working with Relational Data

One of my concerns with Corda in the early days was that there was no easy way to model relational data using states, which is somewhat due to a lack of features in the underlying runtime (the JVM), a lack of features in the supported languages (Java and Kotlin), and a symptom of the way that states work in terms of how they are persisted to the vault.

The following example demonstrates the problem:

```kotlin
data class RelationalState(
    val value: Any
) : LinearState

data class ParentState(
    val value: RelationalState
) : ContractState
```

Here we have one state as a property of another, but the problem is that these will not be serialised and stored in the vault as separate states; rather the related state will be serialised as part of the parent state entirely. This means that the relational state isn’t really a state in its own right. It won’t be persisted to the vault separately, and we haven’t specified any requirements over how the state should be resolved *(for example, are we referencing the latest version of the state, or a specific version)?*.

## What are Pointers?

State pointers are R3’s solution to relational states in Corda. There are two types of state pointer in the Corda SDK, known as a `LinearPointer` and a `StaticPointer`.

### Linear Pointers

A `LinearPointer` maintains a reference to a `UniqueIdentifier`, which when resolved will return the latest version of the linear state (if it’s known by the vault).

```kotlin
data class ParentState(
    val value: LinearPointer<RelationalState>
) : ContractState
```

### Static Pointers

A `StaticPointer` maintains a reference to a `StateRef`, which when resolved will return a specific version of the state (if it’s known by the vault).

```kotlin
data class ParentState(
    val value: StaticPointer<RelationalState>
) : ContractState
```

## Pointers and Reference States

Originally, the design of state pointers mandated that the states being pointed to were included as reference states when used in a transaction. There is some code in the Corda SDK that uses reflection and recursively searches the object graph for state pointers, resolves them and adds the resolved states as reference states to the transaction.

This actually caused an unforeseen bug (which I fixed). The design of reference states in transactions is that they must not be consumed (or *stale*). If you have a state that is pointing to another state using a state pointer and that state is consumed (in the case of linear states, without producing a new linear state), then the state pointer will lock your state and make it completely unusable.

The solution that I provided for this was to add a property to the state pointer implementation which makes the reference state resolution optional when included in a transaction, and this can be chosen as an opt-in per state pointer instance. This means that state pointers can still point to stale data, but they won’t be resolved as reference states in the transaction, and therefore won’t lock up your state forevermore.

## Pointers as a Design Pattern

I’ve been using state pointers since they were first implemented in Corda (4.0 if I remember correctly) and I really like the idea, however, I think that state pointers should be thought of as a design pattern, rather than an API that you consume from the Corda SDK.

R3 have sort of already demonstrated this with `TokenPointer` in the tokens SDK, though the implementation (at the time of writing) is a little shallow in that it only maintains a reference to a `UniqueIdentifier`, and does not perform any state resolution internally.

The rationale for state pointers as a design pattern is that you may come across scenarios in your solution where you have requirements to perform resolutions on relational data. For example, you may want to point to a `QueryableState` implementation, and perform resolution using `VaultCustomQueryCriteria`. In this case linear or static pointers won’t suffice.

Another compelling reason for state pointers as a design pattern is that you can use state pointers to represent a *public* subset of information about the related state, without revealing the state entirely. We’ll take a look at exactly what is meant by this in the following example.

Assume we start with this account state.

```kotlin
data class AccountState(
    val firstName: String,
    val lastName: String,
    val balance: Amount<Currency>,
    internal val previousStateRef: StateRef? = null
) : QueryableState {
    ...
    val hash: SecureHash get() = 
        SecureHash.sha256("$firstName$lastName$previousStateRef")
}
```

Notice that this state has a private property called `previousStateRef`. This allows you to chain states together by allowing a new state to point to a previous version of the state, similar to the way that blocks are chained together in a blockchain. This means that you can manage state evolution, effectively enforcing unique states (again, something not strictly supported in the vault), and prevent things like state forking and merging through your contract.

Also notice that there is a computed `hash` property, which will always be unique, because `previousStateRef` will always be unique for every new version of the state.

Since this implements `QueryableState` let’s take a look at the schema that maps this state to the vault:

```kotlin
object AccountSchema {
    @Entity
    @Table(name = "account_states")
    class AccountEntity(
        @Column(name = "first_name")
        val firstName: String = "",
        @Column(name = "last_name")
        val lastName: String = "",
        @Column(name = "currency_code")
        val currencyCode: String = "",
        @Column(name = "amount")
        val amount: BigDecimal = BigDecimal.ZERO,
        @Column(name = "hash", unique = true)
        val hash: String = ""
    ) : PersistentState()
}
```

Notice that `hash` in this schema is unique, and it always will be because `previousStateRef` will always point to a unique state reference for each evolution of the state.

Now we have a requirement where we need to be able to refer to an account state and every node needs to know who owns the account, but the amount held by the account should be distributed on a need-to-know basis. Ultimately this means that every node knows who owns the account, but only nodes that have witnessed the account state will be able to resolve it.

We could model an abstraction of a state pointer like this. I chose an abstract class over an interface because this should represent the base of what the implementation *is*, rather than what it *does*, though, this is only really useful if you’re going to be building lots of different types of state pointer. If you’re only building one, then it’s probably not worth the abstraction:

```kotlin
@CordaSerializable
abstract class Pointer<T : ContractState> {
    abstract fun resolve(serviceHub: ServiceHub): StateAndRef<T>
    abstract fun resolve(cordaRPCOps: CordaRPCOps): StateAndRef<T>
}
```

Now that we have an abstraction for a state pointer, we can go ahead and implement the requirements specified for an account state pointer:

```kotlin
@CordaSerializable
class AccountPointer(
    val firstName: String,
    val lastName: String,
    val hash: SecureHash
) : Pointer<AccountState>() {
    private val criteria = VaultCustomQueryCriteria(
        expression = AccountEntity::hash.equal(hash.toString()),
        status = Vault.StateStatus.ALL,
        relevancyStatus = Vault.RelevancyStatus.ALL
    )
    override fun resolve(
        serviceHub: ServiceHub
    ): StateAndRef<AccountState> {
        return serviceHub
            .vaultService
            .queryBy<AccountState>(criteria)
            .states
            .singleOrNull()
            ?: throw IllegalStateException("not found")
    }
    override fun resolve(
        cordaRPCOps: CordaRPCOps
    ): StateAndRef<AccountState> {
        return cordaRPCOps
            .vaultQueryByCriteria(
                criteria, 
                AccountState::class.java
            )
            .states
            .singleOrNull()
            ?: throw IllegalStateException("not found")
    }
}
```

Finally, we can consume the `AccountPointer` implementation from another state.

```kotlin
data class ParentState(
    val account: AccountPointer
) : ContractState
val parent = ParentState(
    AccountPointer(acc.firstName, acc.lastName, acc.hash)
)
```

We can determine from this example that all of the specified requirements have been met. Every node that witnesses a `ParentState` will be able to observe who owns the account, but only nodes that witness the `AccountState` with that hash would be able to observe the amount held at that point, by resolving the `AccountPointer` to an `AccountState` instance.

## Summary

We’ve identified what state pointers are and how they solve the problem of relational data in Corda.

We’ve also identified the problems of relying solely on `LinearPointer` and `StaticPointer` and how they sometimes do not fully satisfy business requirements.

Finally we’ve identified how state pointers as a design pattern can be useful in obtaining relational data, allowing us to share information on a need-to-know basis, and allowing us to resolve relational states using custom queries.