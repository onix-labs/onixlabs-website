---
title: "Introduction to the ONIXLabs Kotlin Libraries"
description: "An introduction to the ONIXLabs Kotlin libraries: core extensions, an object graph DSL, validation, projection and calendar-aware scheduling for the JVM."
category: products
order: 6
path: /Documentation/Kotlin/Introduction-To-The-Kotlin-Libraries
published: 2026-11-10
---

Kotlin is one of the most expressive languages on the JVM. Null safety, data classes, extension functions and type-safe builders let a few lines say what used to take a page. Yet in most Kotlin codebases, the same handful of problems still get solved by hand, again and again.

Business rules end up as conditions scattered through services. Conversions between number types quietly overflow. Validation lives in one place, mapping in another and serialisation somewhere else, and each works out the shape of your types for itself. Recurring jobs are scheduled with cron expressions that can't say "the second Tuesday of every month", and time zones get forgotten until the clocks change.

At **ONIXLabs**, we asked a simple question:

> What if you could describe your types once, and let everything that needs to understand them build on that description?

The answer is the **ONIXLabs Kotlin libraries**: a suite of general-purpose libraries for the JVM, with a strong emphasis on correctness, type safety and expressive, idiomatic Kotlin. They fit as cleanly into a small utility as into a large system, without imposing an architecture or locking you into a framework.

## The Problem: The Same Knowledge, Written Many Times

Every non-trivial application has to know things about its own types: which values are valid, how one type maps onto another, how to address a field deep inside a nested object. That knowledge is usually written down several times, in several places, in several styles:

- Validation annotations or hand-written checks in controllers and services
- Mapping code between domain models, DTOs and persistence types
- Error messages that name fields as strings, and drift from the code they describe
- Small helpers for numbers, strings and collections, copied from project to project

Each copy can quietly go out of step with the others. A field is renamed and the mapping breaks; a rule is added in one service and forgotten in another; validation stops at the first problem and reports it as a string a client can only display, not act on.

## The Approach: Describe Once, Reuse Everywhere

The Kotlin libraries tackle this with a few principles that run through every package.

### A Single Description of Each Type

At the centre of the suite is the object graph: a declarative description of a type, written once with `graph<T> { }`. Validation and projection are plugins that interpret the same description, so the knowledge about a type lives in one place, and every member has a precise path that results and failures can point to.

### Correct by Default

The libraries don't fail silently. A type conversion that would overflow or lose precision throws rather than returning the wrong value. A registry with conflicting graphs is rejected when it's built, not when something relies on it. Validation and projection report every failure at once, each at its path.

### Layered and Opt-In

Each package builds on the ones beneath it, and you take only what you need. Graph builds on Core; Graph Validation and Graph Projection build on Graph; Scheduler builds on Core alone.

### A Stable Public Surface

Every library is compiled in Kotlin's explicit API mode, with its public API checked for compatibility on every build. The libraries are built with Kotlin 2.4 for Java 17 and later, and need nothing outside the suite beyond the Kotlin standard library and `kotlin-reflect`.

## What's in the Libraries

### ONIXLabs Kotlin Core

**The problem:** business rules end up as ad-hoc conditions, conversions between types quietly overflow or lose precision, and the same small helpers get copied between projects.

**How it solves it:** [Core](/Products/Kotlin/Core) gives business rules a shape of their own with `Specification<T>`. A specification is an object you can name, test and reuse, and specifications compose with `and`, `or` and `not`:

```kotlin
class CustomerAgeSpecification(private val minAge: Int, private val maxAge: Int) : Specification<Customer>() {
    override fun isSatisfiedBy(value: Customer): Boolean = value.age in minAge..maxAge
}

val eligible = CustomerAgeSpecification(18, 65) and CustomerCountrySpecification("GB", "IE")
```

Every specification describes itself in readable language, and built-in specifications cover strings, collections, comparable values, booleans and any value. Type converters for the numeric types, `BigInteger`, `BigDecimal`, `Boolean`, `Char`, `String` and `UUID` refuse to lose data quietly. `DayOfMonth` and `DayOfMonthOccurrence` describe days like the last Friday of a month. Core also fills the everyday gaps in the standard library, with extensions for numbers, strings, comparables, collections and durations, reflection helpers, and coloured terminal output.

### ONIXLabs Kotlin Graph

**The problem:** validation, mapping and other cross-cutting concerns all need to know the shape of your types, and each usually works it out in its own way, out of step with the others.

**How it solves it:** [Graph](/Products/Kotlin/Graph) describes each type once in a declarative DSL. A graph is built once, is immutable and can be shared across threads. Graphs are collected in a registry with `graphs { }`, which resolves nested types automatically by matching each object's runtime class across its superclasses and interfaces.

Every property, collection element and map entry is a member with a path, such as `Customer.orders[2].total`. Paths can be matched against wildcards and rendered as Kotlin-style paths, JSON Pointers or JSONPath expressions. Member access policies decide which members plugins may read, and the plugin extension points are open, so validation and projection are joined by plugins of your own.

### ONIXLabs Kotlin Graph Validation

**The problem:** validation logic scatters across services and controllers, stops at the first problem, and reports errors as strings that are hard to act on.

**How it solves it:** [Graph Validation](/Products/Kotlin/Validation) declares rules alongside each type's graph, and they apply wherever the type appears:

```kotlin
val RequestGraph = graph<Request> {
    validate {
        Request::text { mustNotBeNullOrBlank() }
        Request::number { mustBeGreaterThanOrEqualTo(10) }
        Request::numberElements.each { mustBeGreaterThanOrEqualTo(123) }
    }
}

val Model = graphs { include(RequestGraph) }
val result = Model.validate(request)
```

Validation descends into nested objects through their own graphs, and results mirror the shape of the subject. Every failure carries its path, a namespaced rule identifier such as `string.notBlank`, the rule's parameters and a message, so a client can act on a failure rather than parse it. Results can be queried by path, turned into an exception or rendered as JSON. Any core `Specification` can be reused as a rule, rules can apply conditionally, and `describe<T>()` lists every rule for a type without a subject, so you can see what will be checked before anything is.

### ONIXLabs Kotlin Graph Projection

**The problem:** moving data between domain models, DTOs and persistence types means pages of hand-written mapping code that changes whenever a type does, and fails one field at a time.

**How it solves it:** [Graph Projection](/Products/Kotlin/Projection) maps objects by convention. Target constructor parameters and mutable properties take their values from source properties with the same name, converted along the way, and nested objects and collections are projected recursively. In the best case, a projection needs no configuration at all:

```kotlin
val summary = Model.project<RequestSummary>(request)
```

Where the convention doesn't fit, a small DSL maps a renamed property, computes a value, applies a specific type converter or ignores a member. Targets without a usable constructor can be created through factories. When something goes wrong, projection carries on wherever it can, then reports every problem together in a single `ProjectionException`, each with its target path, its source path and its cause.

### ONIXLabs Kotlin Scheduler

**The problem:** real schedules are calendar rules, such as the second Tuesday of every month or every other Friday. Cron expressions struggle to express them, and time zones and daylight saving make them easy to get wrong.

**How it solves it:** [Scheduler](/Products/Kotlin/Scheduler) expresses those rules directly, and every calendar schedule names its time zone:

```kotlin
val reporting = schedule(ZoneId.of("Europe/London")) {
    monthly { on(second(TUESDAY)); at(9, 0) }
}
```

Interval schedules repeat at a fixed elapsed time; daily, weekly, monthly and yearly schedules follow the calendar, at any frequency, and several rules can be combined into one schedule. The next occurrence of any schedule can be calculated on its own, or `TaskScheduler` can run tasks in-process. A task that fails is reported and stays scheduled without affecting any other, and each task chooses what happens when a run overlaps the last one or occurrences are missed. The scheduler keeps its state in memory, so occurrences that fall while the process isn't running aren't caught up; those missed while it is running, for example because the machine slept, follow the task's misfire policy.

## Summary

The **ONIXLabs Kotlin libraries** were created so that the knowledge about your types is written once, not scattered across validators, mappers and helpers. **Core** supplies the building blocks, **Graph** describes each type, **Graph Validation** and **Graph Projection** build on that description, and **Scheduler** brings the calendar into recurring work.

Use one library or all five. Either way, your code says what it means, fails loudly when something is wrong, and leaves the framework decisions to you. See them all on the [Kotlin libraries](/Products/Kotlin) page.
