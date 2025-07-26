# Flow Design Guidelines - Part 2

In Part 1 we identified some fundamental design guidelines for implementing flows in Corda; specifically, allowing us to build flows that can be used as **initiating flows** and **non-initiating flows** (or sub-flows), without having to duplicate business logic.

In this article we are going to look at transactional flows which cause state transitions to the ledger, how to specify the notary and flow sessions, and identify some best practices for transactional flow design.

## Prerequisites

Before we can get into the nuts and bolts of transactional flow design, we need some state that we can use to demonstrate some best practices.

### Message State

```kotlin
@BelongsToContract(MessageContract::class)
data class Message(
    val message: String,
    val sender: AbstractParty,
    val recipients: List<AbstractParty>
) : ContractState {
    val participants: List<AbstractParty>
        get() = recipients + sender
}
```

### Message Contract

I don’t want to focus too heavily on the contract implementation here, but let’s assume that the contract contains two commands; `Send` and `Reply`.

#### Send

The Send command will verify the following contract rules.

- On message sending, zero message states must be consumed.
- On message sending, only one message state must be created.
- On message sending, the sender must not be in the recipients list.
- On message sending, there must be no duplicates in the recipients list.
- On message sending, only the sender must sign the transaction.

#### Reply

The Reply command will verify the following contract rules.

- On message replying, only one message state must be consumed.
- On message replying, only one message state must be created.
- On message replying, the sender must not be in the recipients list.
- On message replying, there must be no duplicates in the recipients list.
- On message replying, only the sender must sign the transaction.

Whilst the `Send` and `Reply` commands look almost identical in terms of contract rules, it will become apparent as to why I’ve included a command that requires spending a state in a transaction when we look at notaries.

### FlowLogic Utilities

Before we look at the design of the flow, I have a few tools in my belt which make it much easier to begin putting flows together, and to better reason about what they’re doing.

*Many of these features were demonstrated at CordaCon, and are available as part of the ONIXLabs Corda Core library, including the Transaction DSL, and Flow DSL.*

#### FlowLogic&lt;T&gt;.firstNotary

The `FlowLogic<T>.firstNotary` extension property above just means that you can call `firstNotary` from a sub-classed `FlowLogic<T>` rather than the long winded way of going through the service hub:

```kotlin
val <T> FlowLogic<T>.firstNotary: Party
    get() = serviceHub.networkMapCache.notaryIdentities.first()
```

### FlowLogic&lt;T&gt;.initiateFlows

The extension function above first obtains well-known parties from anonymous parties, and then initiates flow sessions with each of them. Ultimately it just reduces a laborious and repetitive block of code down to a one-liner, and we like one-liners:

```kotlin
fun <T> FlowLogic<T>.initiateFlows(
    parties: Iterable<AbstractParty>
): Set<FlowSession> {
    return parties.map { 
        val party = serviceHub
            .identityService
            .wellKnownPartyFromAnonymous(it)
            ?: throw  FlowException("Cannot resolve party.")

        initiateFlow(party)
    }.toSet()
}
```

### SendMessageFlow Implementation

Now we can go ahead and implement our `SendMessageFlow`. We’re omitting any use of the progress tracker, as we’ll cover this in another post:

```kotlin
class SendMessageFlow(
    private val msg: Message,
    private val notary: Party,
    private val sessions: Set<FlowSession>
) : FlowLogic<SignedTransaction>() {
    companion object {
        private const val FLOW_VERSION_1 = 1
    }
    @Suspendable
    override fun call(): SignedTransaction {
        val unsignedTransaction = with(TransactionBuilder(notary)) {
            addOutputState(msg, MessageContract.ID)
            addCommand(MessageContract.Send, msg.sender.owningKey)
        }
        unsignedTransaction.verify(serviceHub)
        val signedTransaction = serviceHub.signInitialTransaction(
            unsignedTransaction, 
            ourIdentity.owningKey
        )
        return subFlow(FinalityFlow(signedTransaction, sessions))
    }
    @StartableByRPC
    @InitiatingFlow(version = FLOW_VERSION_1)
    class Initiator(
        private val msg: Message,
        private val notary: Party? = null
    ) : FlowLogic<SignedTransaction>() {
        @Suspendable
        override fun call(): SignedTransaction {
            val sessions = initiateFlows(msg.recipients)
            return subFlow(
                SendMessageFlow(
                    msg, 
                    notary ?: firstNotary, 
                    sessions
                )
            )
        }
    }
    @InitiatedBy(Initiator::class)
    class Observer(
        private val session: FlowSession
    ) : FlowLogic<SignedTransaction>() {
        @Suspendable
        override fun call(): SignedTransaction {
            return subFlow(ReceiveFinalityFlow(session))
        }
    }
}
```

That’s a fair chunk of code, so let’s break down the important aspects of it, which are actually just the constructors.

#### Non-Initiating Flow Constructor

The outer class represents a **non-initiating** flow (or sub-flow). We can ignore the message parameter, but what’s important here is that we’re passing the **notary** and a set of **flow sessions**.

```kotlin
class SendMessageFlow(
    private val msg: Message,
    private val notary: Party,
    private val sessions: Set<FlowSession>
) : FlowLogic<SignedTransaction>() { ... }
```

#### Specifying a Notary

We pass the notary into the flow because this respects the Dependency Inversion Principle, whereby the flow should not be responsible for determining which notary to use — rather this should be inverted (Inversion of Control), and determined by the caller.

In most cases I’ve seen, developers tend to pick the first notary from the network map (hence the `firstNotary` extension property), however as a general rule of good practice, we make the notary mandatory from the perspective of the non-initiating flow, and optional from the perspective of the initiating flow.

#### Specifying Participants and Observers

We pass a set of flow sessions into the flow because a general rule of good practice is to only allow initiating flows to create flow sessions, and thread those sessions through non-initiating flows. This means that you can reuse the same flow session for multiple sub-flows and eliminates the network overhead of creating new flow sessions for each sub-flow.

By passing a list of sessions to the flow constructor, we can also include non-participants (observers) who can record the transaction even if they’re not a participant within it.

Note — If you are designing a flow where states in the transaction do not require distribution to any counter-parties (there are no participants in the state apart from the local node), then you can make the sessions parameter optional; for example:

```kotlin
private val sessions: Set<FlowSession> = emptySet()
```

This helps to express intent of the flow — if `sessions` is mandatory, then it tells the consumer that they have to pass sessions for participants, however if it’s optional, it tells the consumer that they can optionally pass sessions for observers.

#### Initiating Flow Constructor

The inner class represents an **initiating flow**. Again, we can ignore the message parameter. Notice that this time, the notary is still passed, but as an optional parameter.

```kotlin
@StartableByRPC
@InitiatingFlow(version = FLOW_VERSION_1)
class Initiator(
    private val msg: Message,
    private val notary: Party? = null
) : FlowLogic<SignedTransaction>() { ... }
```

Since the initiating flow will call into the non-initiating flow, we can obtain a custom notary, or default to `firstNotary` if no notary is specified; for example:

```kotlin
subFlow(SendMessageFlow(msg, notary ?: firstNotary, sessions))
```

### ReplyMessageFlow Implementation

Now we can go ahead and implement our `ReplyMessageFlow`. There are some subtle differences with this flow, so we’ll take a look at the implementation, and then break the flow down to explain the rationale for those differences:

```kotlin
class ReplyMessageFlow(
    private val oldMsg: StateAndRef<Message>,
    private val newMsg: Message,
    private val sessions: Set<FlowSession>
) : FlowLogic<SignedTransaction>() {
    companion object {
        private const val FLOW_VERSION_1 = 1
    }
    @Suspendable
    override fun call(): SignedTransaction {
        val unsignedTransaction = 
            with(TransactionBuilder(oldMsg.state.notary)) {
                addInputState(oldMsg)
                addOutputState(newMsg, MessageContract.ID)
                addCommand(
                    MessageContract.Reply, 
                    newMsg.sender.owningKey
                )
           }
        unsignedTransaction.verify(serviceHub)
        val signedTransaction = serviceHub.signInitialTransaction(
            unsignedTransaction, 
            ourIdentity.owningKey
        )
        return subFlow(FinalityFlow(signedTransaction, sessions))
    }
    @StartableByRPC
    @InitiatingFlow(version = FLOW_VERSION_1)
    class Initiator(
        private val oldMsg: StateAndRef<Message>,
        private val newMsg: Message,
        private val notary: Party? = null
    ) : FlowLogic<SignedTransaction>() {
        @Suspendable
        override fun call(): SignedTransaction {
            val sessions = initiateFlows(msg.recipients)
            return subFlow(
                ReplyMessageFlow(
                    msg, 
                    notary ?: firstNotary, 
                    sessions
                )
            )
        }
    }
    @InitiatedBy(Initiator::class)
    class Observer(
        private val session: FlowSession
    ) : FlowLogic<SignedTransaction>() {
        @Suspendable
        override fun call(): SignedTransaction {
            return subFlow(ReceiveFinalityFlow(session))
        }
    }
}
```

As with the `SendMessageFlow` implementation, the important bits to take away from this are in the constructor.

#### Non-Initiating Flow Constructor

The outer class represents a **non-initiating** flow (or sub-flow). Since the `Reply` command mandates that we consume and produce a state, we’re passing them both into the flow. Notice that now, we’re still passing a flow sessions into the flow, but we’re no longer passing in a notary:

```kotlin
class ReplyMessageFlow(
    private val oldMsg: StateAndRef<Message>,
    private val newMsg: Message,
    private val sessions: Set<FlowSession>
) : FlowLogic<SignedTransaction>() { ... }
```

#### Specifying Input and Output States

I’ve seen a lot of flow implementations where only the new version of the state would be passed to the flow, and the flow would internally perform a vault query to obtain the previous version of the (in this case linear) state, and add that to the transaction. I believe this to be bad practice, because again this violates the Dependency Inversion principle. Also, if you’re following CQRS (or more likely CQS in this case), then your flows will become easier to reason about because they either perform queries to the vault, or commands to perform state transitions, but never both!

#### Specifying the Notary and Flow Sessions

Notice that we no longer specify a notary. The reason we no longer need to pass this into the flow is because we’re consuming a state, which is already bound to a notary, so we continue to use the same notary:

```kotlin
TransactionBuilder(oldMsg.state.notary)
```

We continue to pass in flow sessions, for the same reasons illustrated in the `SendMessageFlow` implementation (see above).

## Summary

We’ve identified how to implement transactional flows in Corda, when and how to specify the notary, when and how to specify flow sessions, and also when to pass in states to be consumed, and how all of these things help to respect the Dependency Inversion Principle (DIP) and Command/Query Separation (CQS).