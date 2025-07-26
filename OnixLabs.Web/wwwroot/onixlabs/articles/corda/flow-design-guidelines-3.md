# Flow Design Guidelines - Part 3

In Part 2 we identified some best practices for implementing transactional flows which cause state transitions to the ledger.

In this article we are going to look at implementing flows that perform vault queries and the best practices and benefits to implementing flows like this.

## Vault Queries

In Corda there are two places where vault queries are commonly implemented — either consuming a `ServiceHub` or a `CordaRPCOps` implementation.

The following examples illustrate simple queries using each interface:

### CordaRPCOps

```kotlin
rpc.vaultQueryByCriteria(queryCriteria, Message::class.java)
```

### ServiceHub

```kotlin
vaultService.queryBy(Message::class.java, criteria)
```

There is a noticeable problem here. The APIs are different which causes the following problems:

- Inconsistent code over time across the code-base.
- Limits ability to reuse code.
- Increases the learning curve for new developers.

## Why Wrap Queries Into Flows?

There’s nothing in Corda that mandates that a flow **must** communicate with other nodes, and query flows are a good example of flows that don’t. Their purpose is only to encapsulate some query criteria and execute that query against the vault.

This flow design was inspired by [Dan Newton](https://github.com/lankydan), one of the developers at R3 who described flows as being a potential mechanism for extending RPC functionality. With that in mind, building query flows provides the following advantages:

- Consistent code over time across the code-base.
- Reusable code.
- Allows code to better describe its behaviour.

## Implementing a Query Flow

All query flows can be implemented with exactly the same primary constructor, however I would advise that for each `ContractState` type, two query flows are implemented; one to return specific items matching the criteria (for example, the latest known version of a state based on its `linearId`), and one to return a list of items matching the criteria (for example, a chain of state transitions based on its `linearId`).

### Singular Query Flow

```kotlin
class FindMessageFlow private constructor(
    private val criteria: QueryCriteria
) : FlowLogic<StateAndRef<Message>>() {
    @Suspendable    
    override fun call(): StateAndRef<Message> {
        return serviceHub
                .vaultService
                .queryBy<Message>(criteria)
                .states
                .singleOrNull()
                ?: throw FlowException("Failed to find state.")
    }
}
```

### Plural Query Flow

```kotlin
class FindMessagesFlow private constructor(
    private val criteria: QueryCriteria
) : FlowLogic<List<StateAndRef<Message>>>() {
    @Suspendable
    override fun call(): List<StateAndRef<Message>>> {
        return serviceHub
            .vaultService
            .queryBy<Message>(criteria)
            .states
    }
}
```

~~Notice that we don't annotate the call functions for query flows with `@Suspendable` because these flows never communicate with other nodes, and therefore never need to suspend.~~

Note on the deleted text (above), according to Dan Newton:

> *With the query flows that are not annotated with* `@Suspendable` *I would still include the annotation because of some work we have done under the hood. There are some slight scenarios that could affect that now so I would keep the annotation. Because of some error handling we have added, it is possible for a flow to suspend even tho it doesn’t communicate with anyone.*

The primary constructor is deliberately private so that consumers of the flow can’t inject criteria that we don’t want this flow to handle. This may seem pretty much unusable in its current state, but that’s because we haven’t provided any constructor overloads to provide criteria to the primary constructor. Each constructor overload that we implement should clearly express the intent of what the query is expecting to retrieve from the vault. The following examples demonstrate this:

### Singular Query Flow

```kotlin
class FindMessageFlow private constructor(
    private val criteria: QueryCriteria
) : FlowLogic<StateAndRef<Message>>() {
    constructor(linearId: UniqueIdentifier) : this(builder {
        VaultLinearQueryCriteria(
            contractStateTypes = setOf(Message::class.java),
            status: Vault.StateStatus.UNCONSUMED,
            relevancyStatus = Vault.RelevancyStatus.ALL,
            linearId = listOf(linearId)
        )
    })
    @Suspendable
    override fun call(): StateAndRef<Message> {
        return serviceHub
                .vaultService
                .queryBy<Message>(criteria)
                .states
                .singleOrNull()
                ?: throw FlowException("Failed to find state.")
    }
}
```

### Plural Query Flow

```kotlin
class FindMessagesFlow private constructor(
    private val criteria: QueryCriteria
) : FlowLogic<List<StateAndRef<Message>>>() {
    constructor(linearId: UniqueIdentifier) : this(builder {
        VaultLinearQueryCriteria(
            contractStateTypes = setOf(Message::class.java),
            status: Vault.StateStatus.ALL,
            relevancyStatus = Vault.RelevancyStatus.ALL,
            linearId = listOf(linearId)
        )
    })
    @Suspendable
    override fun call(): List<StateAndRef<Message>>> {
        return serviceHub
            .vaultService
            .queryBy<Message>(criteria)
            .states
    }
}
```

## Consuming Query Flows

Now that we have implemented a flow to perform vault queries, we have a consistent approach which we can consume from either a flow, or from an RPC client.

### CordaRPCOps

```kotlin
rpc.startFlow(::FindMessageFlow, linearId).getOrThrow()
```

### Flow

```kotlin
subFlow(FindMessageFlow(linearId))
```

Admittedly, this doesn’t improve how the query flow is called, but it does allow us to encapsulate and reuse query logic.

## Summary

We’ve identified how to implement query flows in Corda, how they benefit code reuse by encapsulating query logic into a single, maintainable location, how to express intent via constructor overloads and how to consume query flows from other flows and RPC clients.