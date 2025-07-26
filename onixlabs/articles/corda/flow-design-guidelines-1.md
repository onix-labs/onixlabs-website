# Flow Design Guidelines - Part 1

In this article we are going to take a look at flows in Corda, understanding what they are, how to implement them and extend the Corda Flow Framework, and identify some best practices for flow design.

## What are Flows?

Flows are a fundamental part of Corda’s design. They represent protocols of communication and negotiation between counter-parties; for example, a flow may be designed to allow counter-parties to negotiate and agree on ledger state transitions, or to simply communicate over a peer-to-peer network, or even to extend functionality between nodes and clients over RPC.

## What are Flow Sessions?

Flow sessions are the underlying mechanism that allow flows to communicate with other nodes on the Corda network. A flow session represents a secure, established, point-to-point connection between one node and another.

A flow session represents a secure, authenticated, point-to-point connection between one node and another. Unlike other blockchain technologies, Corda does not broadcast communications to the entire network. Instead, communication is strictly point-to-point.

An instantiated flow session provides functions for communication between nodes—send and receive. It is important that these functions are synchronised, otherwise you will end up with counter-flow errors.

### Sending Data

To send data to another node on the network, we call the send function of the flow session:

```kotlin
session.send("Hello, World!")
```

### Receiving Data

To receive data from another node on the network, we call the receive function of the flow session:

```kotlin
val message = session.receive<String>().unwrap { it }
```

Note that when we receive data from another node, we specify the type of data that we’re expecting the payload to be (in this case `String`).

### Sending and Immediately Receiving Data

There is also a `sendAndReceive` function which we can use when we’re expecting an immediate response back from the other node.

Party A expects an immediate response from Party B:

```kotlin
val response = session.sendAndReceive<String>("Hello, Party B!")
```

Party B receives Party A's message and responds:

```kotlin
val message = partyA.receive<String>().unwrap { it }
partyA.send("Hello, Party A!")
```

## Types of Flow

There are two types of flow in Corda—**initiating** and **non-initiating**.

### Non-Initiating Flows

Non-initiating flows (or sub-flows) represent individual interactions, either with the local node, or with other nodes on the network; for example, the `CollectSignaturesFlow` and `SignTransactionFlow` can be used to obtain a counter-party signature for a signed transaction.

*Another way to think about non-initiating flows is as framework flows; that is, a flow which contains some reusable inter-node communication or business logic.*

### Initiating Flows

Initiating flows represent ordered sequences of events; for example, creating a transaction, verifying and signing the transaction locally, obtaining counter-party signatures, finalising the transaction and committing it to the vault.

_Another way to think about initiating flows is as application flows; that is, a flow that represents an end-to-end business process._

## Flow Design

Initiating flows (application flows) and non-initiating flows (framework flows) are orthogonal, however there are cases where they intersect.

It is generally good practice to design flows as **non-initiating** first, so that they constitute a reusable unit of code, and then add an **initiating** flow implementation over the top, allowing the non-initiating flow to be called as an overall unit of work.

As a general rule of thumb, initiating flows **create** flow sessions, and non-initiating flows **consume** flow sessions. This pattern leads to consistent flow design, and reduces the overhead of creating new flow sessions each time a sub-flow is executed.

## Non-Initiating Flow Design

**Non-initiating** flows (or sub-flows) represent individual interactions, either with the local node, or with other nodes on the network. The following example demonstrates a simple pair of non-initiating flows which allow nodes to send messages to one another.

### SendMessageFlow

```kotlin
class SendMessageFlow(
    private val session: FlowSession,  
    private val message: String
) : FlowLogic<Unit>() {

    @Suspendable
    override fun call() {
        session.send(message)
    }
}
```

### ReceiveMessageFlow

```kotlin
class ReceiveMessageFlow(
    private val session: FlowSession
) : FlowLogic<String>() {

    @Suspendable
    override fun call(): String {
        return session.receive<String>().unwrap { it }
    }
}
```

Notice that flow sessions are passed into each flow’s constructor, rather than passing in a `Party` reference and creating the `FlowSession` instance internally. This means that you can eliminate the overhead of creating multiple flow sessions for each sub-flow, and just continue to reuse the same flow session for multiple sub-flows.

## Initiating Flow Design

**Initiating** flows represent ordered sequences of events.

Since the `SendMessageFlow` and `ReceiveMessageFlow` implementations aren’t annotated with `@InitiatingFlow` or `@InitiatedBy` they can only be used as sub-flows.

Rather than altering their initial implementation to turn them into initiating flows, we can add an additional class to each flow, which represents their initiator (annotated with `@InitiatingFlow`) and their handler (annotated with `@InitiatedBy`). The following example demonstrates the addition of a nested class to each non-initiating flow, allowing it to be used as an initiating flow.

### SendMessageFlow

```kotlin
class SendMessageFlow(
    private val session: FlowSession,
    private val message: String
) : FlowLogic<Unit>() {

    @Suspendable
    override fun call() {
        session.send(message)
    }
    @StartableByRPC
    @InitiatingFlow
    class Initiator(
        private val counterparty: Party,
        private val message: String
    ) : FlowLogic<Unit>() {
        @Suspendable
        override fun call() {
            val session = initiateFlow(counterparty)
            subFlow(SendMessageFlow(session, message))
        }
    }
}
```

### ReceiveMessageFlow

```kotlin
class ReceiveMessageFlow(
    private val session: FlowSession
) : FlowLogic<String>() {

    @Suspendable
    override fun call(): String {
        return session.receive<String>().unwrap { it }
    }
    @InitiatedBy(SendMessageFlow.Initiator::class)
    private class Handler(
        private val session: FlowSession
    ) : FlowLogic<String>() {
        @Suspendable
        override fun call(): String {
            return subFlow(ReceiveMessageFlow(session))
        }
    }
}
```

## Summary

We’ve identified what flows are and how they allow node and inter-node communication on a point-to-point basis with counter-parties on the network.

We’ve seen examples of non-initiating flows (framework flows / sub-flows) and initiating flows (application flows).

We’ve identified a best practice design that allows orthogonal flows to intersect so that they can be used as either initiating or non-initiating flows, without having to create separate classes, or duplicate code.