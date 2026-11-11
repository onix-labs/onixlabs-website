---
title: "Introduction to the ONIXLabs Corda Libraries"
description: "An introduction to the ONIXLabs Corda libraries: Corda Core, the Identity Framework and BNMS, and the problems each one solves for CorDapp developers."
category: products
order: 5
path: /Documentation/Corda/Introduction-To-The-Corda-Libraries
published: 2026-11-10
---

Corda gives organisations something rare: a ledger they can share without sharing everything on it. Facts are distributed on a need-to-know basis, transactions are agreed between the parties they concern, and every state has a contract that decides what may happen to it. It's a powerful foundation, but it's a foundation, not a finished building.

Every CorDapp has to build the same groundwork on top of it. Transactions are assembled by hand, vault queries are written against verbose criteria objects, and flows repeat the same sequence of building, verifying, signing and finalising. Then come the harder questions: who is this counterparty, really, and are they allowed to be here? Each team answers them in its own way, and the answers rarely agree, even between applications running on the same node.

At **ONIXLabs**, we asked a simple question:

> What if every CorDapp started from the same trusted foundations, instead of building them again?

The answer is the **ONIXLabs Corda libraries**: three open-source libraries, each building on the one before. **Corda Core** packages the groundwork every CorDapp needs. The **Identity Framework** models identity as claims that applications can share and trust without copying. The **Business Network Management System (BNMS)** uses those identities to run business networks, whether an operator governs them or their members govern themselves.

## The Problem: The Same Groundwork, Built Differently Every Time

Most CorDapps don't fail on their business logic. They struggle with everything around it:

- Building transactions, and remembering which keys must sign which commands
- Querying the vault, which looks subtly different from inside a flow than it does over RPC
- Coordinating flow sessions, signatures and finality without losing track of who sees what
- Proving who initiated a transaction, not just who eventually signed it
- Deciding who someone is, and whether they belong on the network at all

Written by hand, this groundwork drifts from project to project. Two CorDapps on the same node can model the same identity in incompatible ways, two business networks can define membership so differently that they can't work together, and without a shared answer to "who says so?", nothing stops a participant from simply asserting its own credentials.

## The Approach: Shared Foundations, in Layers

The Corda libraries tackle these problems from the bottom up, and a few principles run through all three.

### Layered by Design

Each library builds on the one beneath it. The Identity Framework's claims are built on Corda Core's state types, and BNMS uses the Identity Framework's claims and attestations to describe membership, roles, permissions and settings. Use Corda Core on its own, or take the whole stack when you need identity and governance too.

### Contracts, Workflows and Integration, Kept Apart

Each library is split into a contract module, a workflow module and an integration module, so what runs during contract verification, inside flows and in a client application stay separate, and each part of your CorDapp depends on only what it needs.

### Idiomatic Kotlin

Corda is written in Kotlin, and these libraries lean into it. Vault queries and transactions are written as small, readable DSLs rather than assembled from builders and criteria objects, and everyday operations become extension functions on the types you already use.

### Privacy Through Trust

The libraries share facts on a need-to-know basis. A claim can be referenced without revealing its value, and an attestation lets a verifier rely on someone else's review of a state without seeing the state itself.

## What's in the Libraries

### ONIXLabs Corda Core

**The problem:** every CorDapp repeats the same groundwork, and it buries the business logic.

**How it solves it:** [Corda Core](/Products/Corda/Core) is a toolkit rather than a CorDapp; it contains no states or contracts of its own. It provides contract, workflow and integration APIs that remove the boilerplate from all three layers.

On the contract side, `ContractID` derives each contract's identifier from its class, so it never has to be written or maintained by hand. `ChainState` links each state to the one before it, preserving a single linear history, and `Hashable` gives a state a unique hash that can be verified without exposing its data. `SignatureData` and `SignedCommandData` require a command to be signed by the party that originated it, so a transaction carries proof of who started it.

In flows, a transaction DSL groups inputs, outputs, commands and signers by intent, and flow steps standardise the work that surrounds it:

```kotlin
val transaction = buildTransaction(notary) {
    addOutputState(customer)
    addCommand(CustomerContract.Issue, customer.owner.owningKey)
}

verifyTransaction(transaction)
val signedTransaction = signTransaction(transaction)
return finalizeTransaction(signedTransaction, sessions)
```

Vault adapters hide the differences between querying through `ServiceHub` inside a node and through `CordaRPCOps` from a client, and the vault query DSL reads like the Kotlin collections it imitates:

```kotlin
val customers = serviceHub.vaultServiceFor<Customer>().filter {
    expression(CustomerEntity::owner equalTo partyA)
}.toList()
```

Resolvable states extend Corda's pointer model, so one state can refer to one or many others and resolve them when needed. Corda Core also includes a messaging API for sending messages between nodes with acknowledgements, and a broad set of extension functions for transactions, keys, sessions and builders. For the thinking behind these APIs, the [Flow Design Guidelines](/Documentation/Corda/Flow-Design-Guidelines-1) show how to structure reusable flows, and [Relational Data & Pointers](/Documentation/Corda/Relational-Data-And-Pointers) treats state pointers as a design pattern for modelling relationships.

### ONIXLabs Corda Identity Framework

**The problem:** identity data piles up in central stores that become targets, every application keeps its own copy of the same facts, and proving one thing often means handing over far more than was needed.

**How it solves it:** the [Identity Framework](/Products/Corda/Identity-Framework) models identity as claims, influenced by the W3C specifications for Verifiable Credentials and Decentralised Identifiers. A claim is a statement about a subject, expressed as a property and a value, and the subject can be an individual, an organisation or a digital asset.

Claims are an open type hierarchy, ready to use as they are or to extend with claim types of your own:

```plaintext
AbstractClaim<T>
├─ Claim<T>
│  └─ EmptyClaim
├─ CordaClaim<T>
│  └─ AttachmentClaim
└─ ClaimPointer<T>
   ├─ LinearClaimPointer<T>
   └─ StaticClaimPointer<T>
```

A `CordaClaim` is a ledger state held between an issuer and a holder, or self-issued when the two are the same. Its value can change over time, and it's shared only with those who need it. Claim pointers let one claim refer to another while keeping its data private: a linear pointer always resolves the latest version of a claim, and a static pointer resolves one specific version.

Attestations make claims trustworthy. An attestation records that a state has been witnessed and either accepted or rejected, and a verifier can rely on it without seeing the state itself. Attestations work for any Corda state, not just claims.

The framework adds an account model, so states can be scoped by account rather than by node alone, and ready-made flows to issue, amend, revoke and publish claims, attestations and accounts. Client applications reach them through dedicated claim, attestation and account services over `CordaRPCOps`.

### ONIXLabs Corda BNMS

**The problem:** Corda nodes often belong to several business networks, each with its own rules for identity and membership. Without common standards those networks can't work together, and since members manage their own membership, nothing stops one from simply asserting its own credentials.

**How it solves it:** the [Business Network Management System](/Products/Corda/Business-Network-Management-System) provides configurable, protocol-level standards for membership and multi-lateral relationships, built on the Identity Framework.

A membership refers to a business network and carries the member's identity, as claims, together with the roles, permissions and settings that govern what it may do there. Membership is always self-issued: joining is a request, and it's only authorised once the membership has been attested. Relationships describe multi-lateral agreements between members, with rules that smart contracts can read at run time, so contract logic can depend on configuration held outside the contract while remaining deterministic.

BNMS supports two models of governance:

- **Centralised networks**, where a business network operator must attest every membership and relationship, and so sees everything on the network.
- **Decentralised networks**, where members attest to one another, and a state is valid only for the members who have attested to it.

Attestations point to a specific version of a membership or relationship, so amending one invalidates the attestations to it until the network re-attests. Relationships go further: each participant receives a revocation lock when a relationship is issued, and a revocation can't complete until every participant has released theirs, which guards against accidental or malicious teardown.

## Summary

The **ONIXLabs Corda libraries** were created to give every CorDapp the same trusted foundations. **Corda Core** removes the boilerplate from contracts, flows and integration. The **Identity Framework** turns identity into claims that applications can share, reference and trust without copying. **BNMS** builds business networks on those claims, governed by an operator or by their members.

Use them together or one at a time, and put your effort into the logic that makes your CorDapp yours. See all three on the [Corda libraries](/Products/Corda) page.
