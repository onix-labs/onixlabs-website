---
title: "Billion-Dollar Mistakes and Functional Fixes"
description: "Why null references and unchecked exceptions cause so many bugs, and how Optional<T> and Result<T> make absence and failure explicit in C#."
category: dotnet
order: 4
path: /Documentation/DotNet/Billion-Dollar-Mistakes-And-Functional-Fixes
published: 2025-12-15
---

## Introduction

Nulls and unhandled exceptions are so ingrained in everyday programming that we often treat their fallout—runtime crashes, brittle code paths, defensive boilerplate—as an unavoidable cost of doing business, yet history and experience suggest otherwise. This article argues that both are not merely nuisances but design flaws with enormous real-world consequences, tracing the origins of null references as a “billion-dollar mistake” and examining how implicit failure modes undermine reliability. From there, it explores how modern type systems and functional patterns—specifically Optional and Result—offer a more honest, explicit way to model absence and failure, turning hidden runtime surprises into compile-time obligations and paving the way for safer, more predictable software.

## The Null Reference: A Billion-Dollar Mistake

Null references have been a lurking menace in software since their inception. In 1965, Tony Hoare introduced the concept of a `null` reference in the language ALGOL W "simply because it was so easy to implement". Decades later he infamously apologised, calling it “*my billion-dollar mistake”.* Why such strong words? Because that one small design choice – allowing a “pointer to nothing” – has probably caused billions in crashes, bugs, and system errors across our industry.

### What Exactly *is* Null?

At its core, `null` is a special sentinel value that represents “no value” or “nothing here.” Instead of an object or data, you get a placeholder that essentially says *“there’s nothing to see here.”* In many languages (like Java, C#, C++), any reference type variable can be `null` by default. This might seem convenient – you can indicate the absence of something without extra code – but it’s a **trap**. Relying on `null` means every single time you access an object, you **must** remember to check if it’s `null` first, or risk a dreaded **NullReferenceException** (in Java, **NullPointerException**). Forget just once, and your program blows up at runtime.

Consider this simple C# example:

```csharp
Customer FindCustomer(int id)
{
    // Find a customer, or return null if the customer is not found.
    return null;
}

var customer = FindCustomer(42);

// Oops! Forgot to check for null...BOOM!...NullReferenceException
Console.WriteLine(customer.Name);
```

One forgotten `if (customer is not null)` and your code crashes. These errors are so common they’re almost a trope – every developer has seen the *“object reference not set to an instance of an object”* error at least once. It’s the kind of bug that might only show up when a certain database record is missing or an API returns an unexpected result, causing production errors that are maddeningly simple in hindsight.

Hoare’s “billion-dollar” quip isn’t hyperbole: null references have likely caused incalculable damage in bugs and downtime. Null was a shortcut that we’ve all been paying for ever since.

### Justifications & Rebuttals

> Can’t I just be careful and check for nulls everywhere? It’s not that hard.

Humans are fallible. You might be disciplined with null checks in the beginning, but as code evolves and deadlines loom, it’s easy to miss one. And each missed check is a potential crash. Relying on vigilance alone is brittle – the more foolproof solution is to make the *absence of a value explicit* in the code’s design, so you **can’t** forget. Enter modern language features and functional concepts that do exactly that.

### Mitigating Null: Nullable Types & Compile-Time Checks

The pain of null references hasn’t gone unnoticed by language designers. Recent languages and updates have introduced features to **mitigate null at compile time** – essentially, to catch those pesky bugs *before* the code ever runs.

#### Kotlin’s Non-Null by Default

In Kotlin, types are non-null by default. If you have a `String` variable, it *cannot* hold `null` – the compiler simply won’t allow it. If you want a variable to be nullable, you must explicitly declare it with a `?` (e.g. `String?`). This forces you to handle the null case. The Kotlin compiler will stop you if you try to call methods on a `String?` without first checking for null or using a safe-call operator. For example, `val length = myString?.length` will yield `null` if `myString` is null, instead of throwing an exception. The language provides convenient syntax like safe calls (`?.`) and the Elvis operator (`?:`) to supply defaults when a value is missing. The result is that **NullPointerExceptions are virtually eliminated** in ordinary Kotlin code – you simply can’t forget to consider `null` because the compiler won’t let you.

#### C# Nullable Reference Types

Starting with C# 8.0, we got a similar (opt-in) feature. Traditionally in C#, reference types have always been allowed to be null, and every dereference was a gamble. Now, with *nullable reference types*, you can flip a switch in your project to treat non-nullable references as the default. If you declare `string name;` the compiler assumes `name` should never be null – and it will issue warnings if you try to assign null or use `name` without initialising it. Conversely, if a variable *can* be null, you mark it `string? name`. The compiler performs *flow analysis* to ensure you check for null before use; for example:

```csharp
string? title = FetchBookTitle(id);
Console.WriteLine(title.Length); // Warning: title might be null (CS8602)
```

The compiler warns you that `title` might be null, reminding you to handle that case (say, with an `if` or the null-coalescing `??` operator). This doesn’t **prevent** you from compiling/running (unlike Kotlin, which errors out), but it makes potential null issues highly visible. The goal is the same: **make nullability part of the type system**. By doing so, the language nudges (or forces) you towards safer code, so that a forgotten null check becomes a compile-time problem, not a runtime crash.

These language features are great, and if you’re using them, you’re a step ahead in the battle against `null`. But what about languages (or legacy code) where such features aren’t available or fully adopted? Here’s where a concept from functional programming shines: the **Optional** type.

### Optional<T>: Banishing Null with a Monad

Optional (also known as *Maybe*, *Option*, etc., in various languages) is a *functional alternative to* `null`. Instead of a reference that might be null, you return an **Optional<T>** that *explicitly* encapsulates “maybe a `T`, or maybe not.” An Optional is essentially a container that either **has a value** or **has nothing** – and it forces the code handling it to acknowledge both possibilities.

Think of an `Optional<T>` as a wrapper around a value that might be missing. It has two subtypes or states:

- `Some<T>` indicates the presence of a value (and contains that value).
- `None<T>` indicates the absence of a value.

In other words, *Optional is a tagged union of* `Some<T>` and `None<T>`. If you have an `Optional<Customer>`, it can either be `Some<Customer>` – meaning it contains a Customer object – or `None<Customer>` – meaning “no customer.” This is similar to how we think of `null`, but crucially, it’s **baked into the type system**. You can’t just pretend an Optional is a real object; you have to check which case it is, or use provided methods to handle the two cases.

In practical terms, using `Optional<T>` in C# might look like this:

```csharp
// A repository method that may find Some<User>; otherwise, None<User>:
public Optional<User> FindUserByEmail(string email) =>
    data.FindByEmail(email).ToOptional();

// Find a user by email:
Optional<User> userOpt = FindUserByEmail("alice@example.com");

// Matching the Optional result:
userOpt.Match
(
    some: (user) => Console.WriteLine("User found: " + user.Name),
    none: () => Console.WriteLine("No user with that email.")
);
```

Here, `FindUserByEmail` returns an `Optional<User>` instead of possibly returning null. If the user is found, we wrap it in a `Some<User>`; if not, we return a `None<User>`. The call site then clearly deals with the *absence* case. Maybe we print a message, maybe we take some alternate action – the point is, we **won’t accidentally call** `user.Name` when there is no user, because `userOpt` isn’t a User, it’s an Optional that we must *unwrap* safely. The type itself guides us to handle the “no value” scenario.

#### Analogy

One way to think of an Optional is as a collection that can hold at most one item. A `None` is like an empty collection, or size 0, and a `Some(T)` is like a collection of size 1 containing `T`. This way, operations on the Optional (like mapping a function over it) can be defined consistently – if it’s a None, the operation just yields None (nothing to do); if it’s a Some, the operation applies to the inner value. This analogy also hints at why we call it a *monad* – but no need to dive deep into category theory here. The key is: **Optional lets us operate on values if they exist, and safely do nothing if they don’t, all without ever throwing a null reference error.**

### From Null to None: Working with Legacy Code

One fantastic benefit of the Optional approach is that it **plays nicely with legacy code that still uses nulls**. You don’t have to rewrite your entire codebase overnight to start reaping the benefits. Instead, you can wrap old patterns incrementally. Most Optional implementations provide a helper for this. In OnixLabs.Core it's `Optional<T>.Of(x)`, or the `ToOptional()` extension: it takes an object `x` that might be null, and returns `None` if `x` is null or `Some(x)` if not. For value types, an overload takes a `T?` nullable struct and converts it the same way.

In our example above, `FindUserByEmail` likely got a `User` from some EF Core database call. Traditional code would return that `User` object or null if not found. By calling `ToOptional()` on the result, we painlessly convert the old convention to a shiny Optional. The rest of our codebase, if it uses `Optional<User>` consistently, now stays null-free beyond that point. Over time, as more functions and methods start returning Optional instead of null, you create a sort of **null-free zone** in your code where the compiler and type system help guarantee you’re not missing things.

### Justifications & Rebuttals

> Optional seems like overkill. Isn’t it just hiding the null-checks in another object? Why not just use null with discipline?

Optional is *absolutely* about moving those null-checks into a safer, more structured form. It’s not hiding them – it’s making the absence of a value an explicit part of the API. This has huge advantages. For one, any function that returns an `Optional<T>` is clearly signalling *“you might not get a T back”*. There’s no need to read documentation or method names to guess “could this return null?” – it’s in the type. Secondly, by providing combinators (map, filter, etc.) and ensuring you can’t get the T out without handling the None case, Optional guides you into writing code that naturally accounts for missing values. In short, it trades a little upfront verbosity for a lot of downstream safety. And far from being overkill, it often *simplifies* code by eliminating tangled if-null-else ladders. With Optional, you handle the empty case once, maybe in one place, instead of scattered null checks everywhere.

### A World Without Null (…Almost)

With practices like these, it’s possible to drastically reduce, or even outright eliminate, null-related crashes. Languages like Swift took the hard line of making *no null at all* (they use Optionals everywhere by default). In C# and Java, using Optional types for return values (and constructor parameters, etc., when appropriate) achieves a similar end. It shifts the question from “will this blow up at runtime?” to “have I handled both outcomes at compile time?” which is exactly where you want that question answered.

Before we move on, let’s concisely wrap up the null story: We started with a sneaky little mistake from 1965 that turned into a billion-dollar headache. We saw how modern type systems (Kotlin, C# 8+) are finally pushing back on that mistake by making nullability explicit. And we introduced `Optional<T>` as a powerful, functional pattern for representing “something or nothing” safely. With Optional, we trade the uncertainty of null for a type that forces clarity. No more billion-dollar null bugs – or at least, far, far fewer of them.

---

## Exceptions: Unchecked & Unhandled

Null references are one giant of buggy behaviour; unhandled exceptions are the other. If nulls are *"billion-dollar mistakes"*, unhandled exceptions are the landmines that blow up our programs in spectacular ways. We need to tackle them with the same candour.

### The Problem with Exceptions

Exceptions were introduced as a way to signal errors or unusual conditions *without* resorting to special return codes for every function. Conceptually, an exception is an out-of-band signal that something went wrong – it unwinds the call stack until some code catches it (or if none catches it, the program typically crashes). This idea actually goes back to the 1960s as well, in languages like PL/I and Lisp, with modern implementations in C++, Java, Python, C#, and many others.

In theory, exceptions make error handling *easier*: you can write the “happy path” code and handle errors separately, rather than cluttering every other line with `if` checks. In practice, exceptions come with their own pitfalls.

#### They’re Invisible in the API

A function can throw an exception that isn’t obvious from its signature. Unless it’s documented (or you know the implementation), you might have no idea that `DoBusinessLogic()` can throw a `DatabaseTimeoutException` or whatever. This is essentially the same problem as returning null – it’s implicit rather than explicit.

#### Unhandled Exceptions & Runtime Crashes

If an exception is thrown and no catch block handles it, it will typically crash the thread or application. In a desktop app that might mean an abrupt termination; in a web server, it might mean a request dies and returns a 500 error (or worse, it could bring down the entire process if it escapes the main loop). As Microsoft’s documentation bluntly puts it: *“A crash is when an exception in your code goes un-handled and terminates the process.”* All your current work is aborted, and the program state is lost. Unhandled exceptions are not gentle failures; they’re dramatic.

#### Control Flow Nightmare

Because exceptions break the normal flow, they can make reasoning about program flow harder. If overused, you find yourself mentally juggling: "this line might jump to that catch, that might rethrow and jump to another catch..." It can get complex, fast.

#### Performance & Other Costs

Exceptions are often more expensive to throw/catch than regular code (not usually an issue unless abused), and they can encourage a lazy style of “if anything goes wrong anywhere, I’ll catch it way up here” which sometimes masks errors instead of handling them.

Don’t get me wrong – exceptions *properly used* are a powerful feature. But when they’re not handled or overused, they become a common source of bugs. How many times have you seen a long-running application crash with a stack trace in the logs indicating an unhandled exception bubbled out? Or a library function throw an exception you didn’t anticipate, leading to inconsistent state?

### Forcing You to Catch: Checked Exceptions

Some languages recognised the “invisible API” problem of exceptions early on. Java, famously, introduced **checked exceptions**. These are exceptions that the compiler forces you to either catch or declare that your method throws. In Java, if a method can throw (for example, `IOException`), you either wrap the call in a try-catch or add `throws IOException` to your method signature, propagating the responsibility upward. This is known as the *“Catch or Specify Requirement”.* If you ignore it, your code won’t compile. The idea was to make the possibility of failure part of the function’s contract.

For example, in Java:

```java
// This function declares it might throw FileNotFoundException
public String readFile(String path) throws FileNotFoundException {
    FileReader reader = new FileReader(path); // FileReader() throws FileNotFoundException
    // ... read file
    return content;
}

// Caller MUST handle or declare the exception:
try {
    String data = readFile("config.txt");
    // use data...
} catch (FileNotFoundException ex) {
    // handle the error, e.g., log and default
}
```

If you forget the try-catch, the code won’t compile. In theory, this means you’ll never have an unhandled `FileNotFoundException` crash at runtime, because you were forced to deal with it.

In practice, Java’s checked exceptions are controversial. They solve one problem (unhandled exceptions) but introduce others – verbosity, and sometimes forcing error handling at levels that can’t do much about it. Many developers grew weary of writing boilerplate `throws` clauses and catch blocks, sometimes catching an exception only to wrap it in a new exception type and re-throw it (or even worse, swallowing it). This led to patterns of “catch and log and continue,” which aren’t much better. Other languages (like C#, Python, etc.) chose not to go the checked route – all exceptions in those languages are unchecked (the compiler doesn’t enforce handling). That puts the onus on the developer to be aware and handle appropriately.

No matter which camp you’re in (checked vs unchecked), the fundamental issue remains: how do we make error outcomes explicit and guide the programmer to handle them? If only we could *return* an error or a result in a structured way… which brings us to the functional answer: the **Result** monad.

### Result & Result<T>: Railway-Oriented Error Handling

Just as Optional replaces “value or null” with an explicit “value or none,” a **Result type** replaces “return value or throw exception” with an explicit **success** or **failure** result. In a sense, `Result` is to exceptions what `Optional` is to null. It wraps the outcome of an operation, which can be one of two things:

- **Success (or Success<T>):** indicating the operation succeeded (optionally holding a value of type `T` if there is a result).
- **Failure (or Failure<T>):** indicating the operation failed (holding an error information, like an exception or message).

In other words, instead of throwing an exception or returning a value, your function returns *one* thing – a Result – that *contains either the value (on success) or an error (on failure).* The caller is then forced to handle both cases because, well, they’re holding a Result object that they need to inspect.

Let’s illustrate with a C# example. Without a Result type, you might write:

```csharp
// Traditional approach:
int CalculateDivision(int a, int b) => b is 0
    ? throw new DivideByZeroException("b cannot be 0")
    : a / b;

try {
    int quotient = CalculateDivision(x, y);
    Console.WriteLine($"Result is {quotient}");
} catch (Exception ex) {
    Console.WriteLine($"Calculation failed: {ex.Message}");
}
```

With a Result type, it could look like:

```csharp
// Using Result<T> monad:
Result<int> CalculateDivision(int a, int b) => b is 0
    ? Result<int>.Failure(new DivideByZeroException("b cannot be 0"))
    : Result<int>.Success(a / b);

CalculateDivision(x, y).Match
(
    success: (value) => Console.WriteLine($"Result is {value}"),
    failure: (error) => Console.WriteLine($"Calculation failed: {error.Message}")
);
```

Here, `CalculateDivision` never throws. Instead, it returns a `Result<int>`. On success, it wraps the integer result; on failure, it wraps an exception inside a Failure. The calling code can’t ignore the possibility of failure – the `Result<int>` demands to be checked. If you try to get the `Value` when it’s a failure, you might get an invalid operation or another safe outcome, depending on the implementation – but essentially, the design nudges you to *check first*. By making success vs failure an explicit part of the type, we eliminate the surprise of exceptions. Any code handling a `Result<T>` knows it might not contain a valid value and must deal with that.

#### Note

This pattern is sometimes called *railway oriented programming*, especially in F#/functional circles. Imagine your code’s happy path as one rail, and any error as a switch to a parallel rail of failure. Using Result/Optional monads, you can chain operations without constantly doing if-else checks; the monad takes care of propagating the failure state. You only check once at the end if everything succeeded or if a failure short-circuited the process. This avoids deeply nested try/catch or if/else pyramids, leading to clearer code flow.

The Result type can be seen in many languages:

- Rust’s `Result<T, E>` (with `Ok(T)` and `Err(E)`) is a famous example – Rust has no exceptions at all; you **must** use `Result` for anything that can fail, or panic (crash) explicitly.
- Scala’s `Either` (conventionally `Right` for success and `Left` for failure).
- Haskell’s `Either` or `Maybe` monads.
- Even in C++, folks use `std::variant` or similar patterns to emulate a Result instead of using exceptions.

In C# and .NET, we don’t have a built-in Result in the base class library (though `TryParse`-style patterns and the newer `OneOf`/`Maybe` libraries fill this gap). However, it’s easy to introduce through a library such as [OnixLabs.Core](/Products/DotNet#onixlabs-core), whose `Result` and `Result<T>` are implemented to carry either a success (with value) or failure (with error). Under the hood, they’re typically just a struct or class that has a flag and either a value or an exception reference.

### Bridging Exceptions with Result: Handling Legacy Throwers

Much like Optional can interoperate with legacy `null` returns, `Result` can interoperate with traditional exception-throwing code. How? By catching exceptions and turning them into failures. This is incredibly useful for gradually adopting a Result-based approach in an existing codebase.

Imagine you have a legacy method that throws, but you want to use Result going forward:

```csharp
// Legacy method:
Customer LoadCustomer(int id) {
    if (!_db.Exists(id)) throw new InvalidOperationException("Customer not found");
    // ... load and return
}

// New adapter using Result:
Result<Customer> TryLoadCustomer(int id) {
    try {
        return LoadCustomer(id); // Implicit cast to Success<Customer>
    } catch (Exception ex) {
        return ex; // Implicit cast to Failure<Customer> encapsulating the exception
    }
}
```

Now `TryLoadCustomer` will never throw; it catches any exception from `LoadCustomer` and returns a `Failure<Customer>` wrapping that exception. The nice part is we preserve the error info – the `Failure` can carry the caught exception (or just the message, or a custom error type). The caller of `TryLoadCustomer` can inspect the failure and see *which* exception occurred, effectively getting the same info as a catch block would, but without crashing or unwinding the stack. We have *contained* the exception in a safe package.

Over time, you might refactor `LoadCustomer` itself to return Result and not throw at all. But even without touching `LoadCustomer`, you’ve made its outward behaviour safer. This is the power of these patterns – they aren’t all-or-nothing. You can gradually **encapsulate unpredictable exceptions** into predictable result objects.

### Justifications & Rebuttals

> Why not just use try/catch in the calling code? Why wrap exceptions in another object?

Using try/catch is fine for one-off calls. But when failure is a *expected* outcome of a function (e.g., “file might not exist”, “parse might fail”), sprinkling try/catch everywhere leads to verbose, repetitive code – and sometimes developers simply omit it (leading to crashes). A Result type makes the expectation explicit and uniforms the handling. It also composes better – you can pass a Result through multiple layers without each needing its own try/catch unless it wants to handle it. In other words, Result gives us *checked exceptions* in spirit, but with the ergonomics of a return type. It localises error handling responsibility: maybe low-level code converts exception -> Result, and higher-level code decides what to do with failures (log, retry, user message, etc.). By treating exceptions as data, we gain flexibility. We can even map different Failure types, accumulate errors, etc., all in a type-safe way.

### Succeed or Fail, But Never Surprise

The introduction of Optional and Result into your coding practices can feel like a paradigm shift at first. Instead of *ignoring* problems until they explode (null dereferences, uncaught exceptions), you design your functions and methods to communicate the possibility of absence or failure upfront. It’s a very honest way of programming – no pretending that “nothing will go wrong here.” On the contrary, you acknowledge from the start: this function might not return a meaningful value (Optional), or this operation might not succeed (Result). And by doing so, you, or whoever calls your code, can handle those outcomes deliberately.

We’ve all been trained to think of exceptions as, well, *exceptional* – something you rarely expect. But the reality is many error conditions are completely foreseeable (a user might input invalid data, a file might not exist, a network call may fail). Treating these as *expected variants* of a function’s result, rather than unchecked bombs, leads to more robust software.

Before concluding, it’s worth noting: neither null alternatives nor Result monads magically fix all bugs. You can still mis-handle an Optional (maybe you always assume Some and then call `.Value` without checking – which a well-designed API might prevent, but you could cast or circumvent). You could still ignore a Result’s failure by always assuming success. But you have to go out of your way to do so – which is the point. These tools guide the *average* developer onto the pit of success, whereas naked nulls and exceptions leave open manholes all over your code for people to fall into.

## Conclusion: Legacy Pitfalls and Functional Solutions

Nulls and exceptions – two of the most enduring sources of bugs in software – both stem from a common issue: **implicit error states**. A null is an implicit “no value” that isn’t reflected in the type system, and an exception is an implicit alternative control flow that isn’t reflected in a function’s signature. The functional approaches we discussed, Optional and Result, tackle these by making the possibility of “nothing here” or “failure occurred” explicit and visible in our code’s structure.

In both cases, the pattern is similar:

1. **The Problematic Feature:** (Null references or Exceptions) – Powerful, but dangerous when unchecked.
2. **The Pain:** (NullReferenceExceptions and crashes from unhandled Exceptions) – Often hard-to-debug, runtime failures.
3. **The Solution:** (Optional and Result monads) – Wrap the dangerous concept in a type that requires explicit handling of both outcomes (Some/None, Success/Failure).
4. **Interoperability:** Both Optional and Result can be introduced gradually. You can convert null-returning code to Optional-returning, and exception-throwing code to Result-returning, without rewriting your entire codebase in one shot. They act like adapters around legacy practices, allowing you to incrementally raise the safety of your code.

By embracing these patterns, you essentially adopt a philosophy of **explicitness**. Your functions will declare up front: *“I might not return a value”* or *“I might fail”*, and your callers will be forced to acknowledge that. This leads to code that is self-documenting in terms of behaviour and much less prone to oversights.

To be clear, I’m not suggesting that you should never use `null` or throw exceptions – there are scenarios where those might be appropriate (especially in quick scripts or simple apps). But in robust, large-scale software, minimising hidden error states is a huge win. Personally, I’ve reached a point where returning a raw `null` or letting an exception bubble up feels like bad practice (almost a code smell) unless I have a very good reason. Instead, wrapping operations in Optional and Result gives me confidence that I’ve accounted for the edge cases. It’s about **building failure handling into the architecture of our code, rather than tacking it on as an afterthought**.

In the end, our goal as developers is not just to make things *work*, but to make them *fail gracefully*. By learning from past mistakes – those billion-dollar mistakes – and applying some wisdom from functional programming, we can write code that is clearer, safer, and more maintainable. We can let types and compiler checks do the heavy lifting of keeping us honest. Null references and unhandled exceptions will never be completely eradicated from the world, but in our own code, we have the tools to nearly eliminate them. And when someone asks why the extra fuss, we can confidently say: *because preventing a crash is always easier than debugging one*.

## Optional and Result in OnixLabs.Core

Every example in this article uses the `Optional<T>` and `Result<T>` from [OnixLabs.Core](/Products/DotNet#onixlabs-core), and the library adds a few things that make them easier to adopt in an existing codebase.

```csharp
using OnixLabs.Core;

// Bridge a throwing method in one line: the exception becomes a Failure<Customer>.
Result<Customer> customer = Result<Customer>.Of(() => LoadCustomer(id));

// Chain steps on the success rail; the first failure skips the rest.
Result<Invoice> invoice = customer
    .Select(value => value.Account)
    .SelectMany(account => CreateInvoice(account));

// Leave the rails when you're ready, handling both outcomes.
string summary = invoice.Match(
    success: value => $"Invoice {value.Number} created",
    failure: exception => $"Couldn't create an invoice: {exception.Message}");
```

`Result<T>.Of` replaces the hand-written try/catch adapter from earlier, and async versions of `Of`, `Select`, `SelectMany` and `Match` cover asynchronous code. Both types compare by value, and `Optional<T>` is constrained to non-nullable types, so `null` can't sneak back in through the wrapper.

See [Optional&lt;T&gt;](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.Optional) and [Result&lt;T&gt;](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.Result-T) in the API reference, or [Understanding Monads](/Documentation/DotNet/Understanding-Monads) for the idea behind them both.
