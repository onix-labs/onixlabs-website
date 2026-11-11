---
title: "Introduction to the ONIXLabs .NET Libraries"
description: "An introduction to the ONIXLabs .NET libraries: what Core, Numerics, Security, Element Framework and DependencyInjection solve, and how."
category: products
order: 4
path: /Documentation/DotNet/Introduction-To-The-DotNet-Libraries
published: 2026-11-10
---

Modern .NET is a remarkable platform. The base class library covers more ground than ever, the language keeps getting more expressive, and generic math has brought numbers into the type system. Yet everyday code still rests on quiet assumptions: that a value is there, that an operation succeeded, that a string holds what it should, that a decimal has enough precision, that an array of bytes is a signature and not a hash.

When those assumptions live only in someone's head, bugs slip through the gaps. A method that can fail looks exactly like one that can't. A key used for the wrong job compiles just as happily as the right one. And the code that wires an application together grows longer and more repetitive with every service it adds.

At **ONIXLabs**, we asked a simple question:

> What if your types said exactly what you meant, and the compiler held you to it?

The answer is the **ONIXLabs .NET libraries**: a suite of general-purpose, production-ready libraries for modern .NET, with a strong emphasis on correctness, composability and value semantics.

**They are not a framework.** They fit as cleanly into a small utility as into a large system, without imposing an architecture or locking you into anything. Use one package or all of them.

## The Problem: Intent That Lives Outside the Code

Most bugs aren't exotic. They come from the same few places, over and over again:

- Absence and failure hidden behind `null` and exceptions, invisible in a method's signature
- Business rules rewritten in every query, filter and validation that needs them
- Equality and comparison operators that drift out of step with `Equals` and `CompareTo`
- Numbers that outgrow their range, or quietly lose precision on the way between binary and decimal
- Keys, hashes, signatures and secrets handled as anonymous bytes, and secrets left readable in memory
- Connected data forced into tables, or tied to one graph database's query language
- Service registrations with decisions, like a service's lifetime, hard-coded into them

None of these is hard to get right once. The difficulty is getting them right every time, in every project, by every developer. The libraries give each of these concerns a place in the code itself, so that a rule written once can be reused anywhere.

## The Approach: Make Intent Explicit

The libraries share a handful of principles.

### Correctness First

Absence, failure, precision and identity are made explicit in the types, so the compiler and the next developer can see what you meant. Where the safe choice and the convenient choice differ, the libraries make the safe choice the easy one.

### Value Semantics Throughout

Values are compared by what they contain, not where they live. `IValueEquatable<T>` and `IValueComparable<T>` require the matching operators, so they can't be forgotten. The primitives in Numerics and Security follow the same rules. If you want to know why this matters, [Equality and Value Semantics](/Documentation/DotNet/Equality-And-Value-Semantics) goes deeper.

### Built on .NET, Not Around It

The libraries extend what .NET already gives you rather than replacing it. The number types plug into .NET's own generic math. The SHA-3 implementations are standard `HashAlgorithm` types. Text encodings parse and format through .NET's standard interfaces, and dependency injection works with Microsoft's container. Your existing knowledge keeps working.

### Light on Dependencies

Core has no third-party dependencies, and Numerics, Security and DependencyInjection build on it. The cryptography package adds only Microsoft's `System.Security.Cryptography.Pkcs`.

## What's in the Libraries

The libraries cover five areas, each solving a distinct problem.

### OnixLabs.Core

The primitive types that the base class library left out. `Result` and `Result<T>` return success or failure as a value, so a method's signature says it can fail. `Optional<T>` makes absence explicit, with distinct `Some` and `None` states instead of `null`. Both compose fluently, with `Task` and `ValueTask` overloads throughout; [Understanding Monads](/Documentation/DotNet/Understanding-Monads) and [Billion-Dollar Mistakes and Functional Fixes](/Documentation/DotNet/Billion-Dollar-Mistakes-And-Functional-Fixes) explain the ideas behind them.

Around them, Core adds smart enumerations that can carry data and behaviour, guard clauses that read like the rule they enforce, strongly typed `Base16`, `Base32`, `Base58` and `Base64` text, and the LINQ queries LINQ leaves out. `Specification<T>` captures a business rule as an expression tree, so you write it once and reuse it everywhere, including in database queries:

```csharp
Specification<Order> isPaid = new CriteriaSpecification<Order>(order => order.IsPaid);
Specification<Order> isLarge = new CriteriaSpecification<Order>(order => order.Total > 1000m);

IQueryable<Order> largeUnpaidOrders = orders.Where(isLarge.And(isPaid.Not()));
```

Combined rules stay plain expression trees, so query providers can translate them.

[Explore the Core library](/Products/DotNet/Core).

### OnixLabs.Numerics

Advanced number types for when `decimal` and `double` aren't enough. `BigDecimal` holds decimal numbers of any size exactly, as an unscaled integer and a scale. `Int256`, `UInt256`, `Int512` and `UInt512` widen the integers, and `Float128` and `Float256` implement IEEE 754 binary128 and binary256 for calculations where a `double` runs out of precision. `NumberInfo` takes any decimal number apart into its unscaled value, scale, significand, exponent, precision and sign.

Everything implements .NET's generic math interfaces, so the same generic algorithms and operators work across them. And because even whether 1.20 equals 1.2 depends on what you're doing, you decide what equality means:

```csharp
BigDecimal a = new(120, 2); // 1.20
BigDecimal b = new(12, 1);  // 1.2

bool numericallyEqual = a == b;   // true: == compares the numeric value
bool strictlyEqual = a.Equals(b); // false: Equals compares value and scale
```

Conversions are on your terms too: `ConversionMode` chooses between the shortest decimal that round-trips and the exact binary value a float actually holds. [The Problem with Decimals](/Documentation/Number-Theory/The-Problem-With-Decimals) covers why precision and scale matter.

[Explore the Numerics library](/Products/DotNet/Numerics).

### OnixLabs.Security

Security code fails quietly. A key used for the wrong job, a value compared the wrong way or a secret left readable in memory all look like working code. The security packages give keys, signatures, hashes, salts and secrets types of their own, so it's always clear what you're holding and what you can do with it. They have value semantics, and compare in constant time.

`OnixLabs.Security.Cryptography` signs and verifies with ECDSA, EdDSA and RSA, and agrees keys with ECDH. EdDSA is a managed implementation of Ed25519 as specified in RFC 8032, so it doesn't depend on the platform's own support:

```csharp
EddsaPrivateKey privateKey = EddsaPrivateKey.Create();
EddsaPublicKey publicKey = privateKey.GetPublicKey();

DigitalSignature signature = privateKey.SignData(data);
bool isValid = publicKey.IsDataValid(signature, data);
```

It also includes a fully managed FIPS 202 implementation of SHA-3 and SHAKE, Merkle trees that summarise a set of data in a single hash, and key import and export in the standard formats. `Secret` keeps sensitive values encrypted in memory, and private keys are protected the same way. Alongside it, `OnixLabs.Security` generates security tokens from the characters you choose, using a cryptographically secure random source or a seeded one for repeatable tests.

[Explore the Security library](/Products/DotNet/Security).

### OnixLabs.ElementFramework

Graph databases are a natural fit for connected data, but each speaks its own query language, and working with one often means writing queries by hand and tying your code to a single database. Element Framework is an object-graph mapper that brings the ergonomics of Entity Framework to labelled-property-graph databases.

You model your domain in plain C# types, configure them fluently, and work with them through a `GraphContext`. The framework tracks your changes and translates them, and your traversals, into statements native to the provider:

```csharp
context.Nodes<Author>().Add(ada);
context.Nodes<Post>().Add(post);
context.Edges<Wrote>().Connect(ada, new Wrote { WrittenAt = DateTimeOffset.UtcNow }, post);

await context.SaveChangesAsync();
```

It ships providers for Neo4j, Apache AGE on PostgreSQL and ArangoDB, plus an in-memory store for tests. All four pass the same provider-agnostic conformance suite, so one model runs on each of them.

### OnixLabs.DependencyInjection

As an application grows, so does the code that wires it together. DependencyInjection adds lightweight extensions to Microsoft's `IServiceCollection` that trim that setup down without replacing the container you already use. `AddService` and `AddKeyedService` take a service's lifetime as a value, so configuration can make the decision that code shouldn't:

```csharp
ServiceLifetime lifetime = Enum.Parse<ServiceLifetime>(configuration["Orders:Lifetime"] ?? "Scoped");

services.AddService<IOrderService, OrderService>(lifetime);
```

## Built for Modern .NET

Every package targets .NET 8, 9 and 10, and is published to NuGet. The libraries are open source: the [core repository](https://github.com/onix-labs/onixlabs-dotnet) is licensed under the Apache License 2.0, and [Element Framework](https://github.com/onix-labs/onixlabs-dotnet-element-framework) under the MIT License.

## Summary

The **ONIXLabs .NET libraries** exist to solve a problem every .NET team meets: intent that lives in people's heads instead of in the code. By giving absence, failure, business rules, precision, cryptographic material, connected data and service lifetimes types of their own, they let the compiler catch what reviews miss, and let the next developer see what you meant.

They don't ask you to adopt an architecture or abandon what .NET already does well. Start with the package that solves today's problem, and add the others when you need them. [See the full range on the .NET libraries page](/Products/DotNet).
