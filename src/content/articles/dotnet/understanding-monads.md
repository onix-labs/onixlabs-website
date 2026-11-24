---
title: "Understanding Monads"
description: "What a monad is, explained by building one in C#: wrapping, chaining and flattening, the three laws, and how Optional<T> and Result<T> put them to work."
category: dotnet
order: 3
path: /Documentation/DotNet/Understanding-Monads
advert: dotnet
published: 2025-12-15
updated: 2026-11-24
---

## Introduction

Imagine a treasure hunt. You're handed a box. Inside there might be a clue that leads to another box, which might hold a clue to another, and so on until the treasure. Or a box might be empty, in which case the hunt is over.

The rules fit on a postcard. *Open the box. If there's a clue, follow it. If there isn't, stop.* Nobody repeats them at every step. They apply to the whole hunt, so each clue only has to say where to go next.

That's a monad: a kind of box, along with a rule for getting from one box to the next.

You may have met a less friendly explanation:

> A monad is a monoid in the category of endofunctors.

It's often said that once you understand monads, you lose the ability to explain them. We'll try anyway, and without any category theory, by starting with an everyday problem and building the solution one piece at a time. By the end we'll have written a monad, found several more that you've been using for years, and even made some sense of that sentence.

We'll stay on the map from [Equality and Value Semantics](/Documentation/DotNet/Equality-And-Value-Semantics), with points, landmarks and routes. Code samples leave out documentation comments and argument validation for brevity.

## The Problem Between the Steps

Here's an atlas, with three things that we can ask it:

```csharp
public readonly record struct Point(int X, int Y);

public sealed record Landmark(string Name, Point Position);

public sealed record Route(string Name, IReadOnlyList<Point> Waypoints);

public interface IAtlas
{
    Landmark? FindLandmark(string name);

    Route? FindRoute(Landmark landmark);

    Point? FindStart(Route route);
}
```

Any of them might have no answer. The landmark might not be on the map, there might be no route to it, and the route might have no waypoints yet. We'd like to find the landmark, then the route, then the place to start.

```csharp
public static string Describe(IAtlas atlas, string name)
{
    Landmark? landmark = atlas.FindLandmark(name);

    if (landmark is null)
        return "Nowhere to go";

    Route? route = atlas.FindRoute(landmark);

    if (route is null)
        return "Nowhere to go";

    Point? start = atlas.FindStart(route);

    if (start is null)
        return "Nowhere to go";

    return $"Start at ({start.Value.X}, {start.Value.Y})";
}
```

There are three interesting lines here, and they're buried. Between each step and the next is the same piece of plumbing: check whether there's an answer, and give up if there isn't. Add a fourth step, and you add a fourth check. Forget one, and it compiles with a warning at best.

The steps are different each time. What happens *between* them is always the same. What if we could write it once?

## Building a Monad

### Step 1: Wrap a Value

First, we need a box: a type that either holds a value or is empty.

```csharp
public abstract record Maybe<T> where T : notnull;

public sealed record Some<T>(T Value) : Maybe<T> where T : notnull;

public sealed record None<T> : Maybe<T> where T : notnull;
```

A `Maybe<Landmark>` is either `Some<Landmark>`, with the landmark inside, or `None<Landmark>`. Because they're records, two boxes with equal contents are equal, which will be useful later.

The atlas can now say what it means:

```csharp
public interface IAtlas
{
    Maybe<Landmark> FindLandmark(string name);

    Maybe<Route> FindRoute(Landmark landmark);

    Maybe<Point> FindStart(Route route);
}
```

### Step 2: Change What's Inside

Suppose we have a `Maybe<Landmark>`, and we want its position. We could open the box, take the position, and put it in a new box. But if there's nothing inside, there's nothing to do, and we'd be back to checking.

Instead, let's give the box a method that does it for us. It's called `Select`, like the one in LINQ.

```csharp
public abstract record Maybe<T> where T : notnull
{
    public Maybe<TResult> Select<TResult>(Func<T, TResult> selector) where TResult : notnull => this switch
    {
        Some<T> some => new Some<TResult>(selector(some.Value)),
        _ => new None<TResult>()
    };
}
```

```csharp
Maybe<Landmark> landmark = atlas.FindLandmark("Smugglers' Cove");
Maybe<Point> position = landmark.Select(value => value.Position);
```

If there's a landmark, we get a box with its position. If there isn't, we get an empty box. The check is still happening, but it's inside `Select`, where it's written once.

### Step 3: Flatten

Now for the next step in the hunt. We have a `Maybe<Landmark>`, and `FindRoute` wants a landmark. `Select` looks like the answer again, but look at what we get:

```csharp
Maybe<Maybe<Route>> route = landmark.Select(value => atlas.FindRoute(value));
```

It's a box inside a box. `FindRoute` already returns a box, and `Select` dutifully put it inside another. Do this twice more, and we'd need to open four boxes to find out where to start.

We don't care how many boxes the answer came in. We need a method that follows the clue, and leaves us with just one. LINQ has a name for that too, `SelectMany`:

```csharp
public Maybe<TResult> SelectMany<TResult>(Func<T, Maybe<TResult>> selector) where TResult : notnull => this switch
{
    Some<T> some => selector(some.Value),
    _ => new None<TResult>()
};
```

Compare it with `Select`. The only difference is that it doesn't wrap the result, because the result is already wrapped. That small difference is the whole trick. This is the rule on the postcard: if there's a clue, follow it, and if there isn't, stop.

### Step 4: Leave

Eventually we want an ordinary value again. `Match` opens the box, and makes us say what to do in both cases:

```csharp
public TResult Match<TResult>(Func<T, TResult> some, Func<TResult> none) => this switch
{
    Some<T> value => some(value.Value),
    _ => none()
};
```

### The Result

Here's `Describe` again:

```csharp
public static string Describe(IAtlas atlas, string name) => atlas
    .FindLandmark(name)
    .SelectMany(landmark => atlas.FindRoute(landmark))
    .SelectMany(route => atlas.FindStart(route))
    .Match(
        some: start => $"Start at ({start.X}, {start.Y})",
        none: () => "Nowhere to go");
```

The three interesting lines are all that's left. The plumbing has gone inside the box, and "Nowhere to go" is written once, at the end, where we decide what an empty box means.

You could add ten more steps without adding a single check, and you couldn't forget one if you tried.

## So What *Is* a Monad?

We've just built one. A monad is a type with three things:

1. **A way in.** Something that puts an ordinary value in the box. For `Maybe<T>`, that's `new Some<T>(value)`.
2. **A way onward.** Something that follows a function returning another box, and flattens the result. That's `SelectMany`.
3. **Good behaviour.** The two have to fit together in the way you'd expect, which we'll come to next.

`Select` isn't on the list because you get it for free. To change what's inside a box, follow a function that changes the value and puts it straight back in a box. `Match` isn't on the list because some monads never let you out.

Part of what makes monads confusing is that everybody calls these by different names:

| Language | Change the value | Way onward |
|---|---|---|
| C# (LINQ) | `Select` | `SelectMany` |
| Java, Kotlin | `map` | `flatMap` |
| JavaScript | `then` | `then` |
| Rust | `map` | `and_then` |
| F# | `map` | `bind` |
| Haskell | `fmap` | `>>=` |

They're all the same two ideas. The way in has even more names: `Some`, `of`, `pure`, `unit`, `resolve` and, in Haskell, `return`.

### The Three Laws

Good behaviour has a precise meaning. There are three laws, and each says that something you'd assume is true really is. In each case, `find` and `follow` are functions that take a value and return a box.

**Left identity: putting a value in a box, then following a function, is the same as calling the function.**

```csharp
new Some<int>(1).SelectMany(find) == find(1)    // True
```

**Right identity: following a function that only puts the value back in a box changes nothing.**

```csharp
box.SelectMany(value => new Some<int>(value)) == box    // True
```

**Associativity: it doesn't matter how you group the steps.**

```csharp
box.SelectMany(find).SelectMany(follow) == box.SelectMany(value => find(value).SelectMany(follow))    // True
```

You'll rarely need to check these, but you rely on them all the time. The first two say that boxing a value adds nothing and loses nothing. The third is why you can take two steps out of the middle of a chain, move them into a method of their own, and be sure that nothing changes. Without it, refactoring would be a gamble.

### A Law Being Broken

The laws sound so obvious that it's hard to imagine breaking one, so here's how it happens. Suppose we add a convenient way in, which treats the default value of a type as if it were missing:

```csharp
public static Maybe<T> Of(T value) =>
    EqualityComparer<T>.Default.Equals(value, default) ? new None<T>() : new Some<T>(value);
```

It's a reasonable thing to want. Plenty of methods return zero, or an empty identifier, to mean "not found". Now try left identity, with a function that adds one:

```csharp
Func<int, Maybe<int>> addOne = value => new Some<int>(value + 1);

addOne(0)                             // Some(1)
Maybe<int>.Of(0).SelectMany(addOne)   // None
```

They should be the same, and they aren't. `Of` lost the zero on the way in. Every number works except that one, so a chain that starts with `Of` is correct until the day somebody's answer happens to be zero.

That doesn't make `Of` wrong. It's useful for turning the outside world's conventions into boxes, as long as you know it's making a decision as well as wrapping a value. It just isn't the way in.

## Monads You Already Use

`Maybe<T>` is only one kind of box. What varies from one monad to the next is the **context**, meaning what the box says about its value, and therefore what has to happen between the steps.

| Type | What the box says | What happens between steps |
|---|---|---|
| `Maybe<T>` | It might be missing | Stop if there's nothing |
| `IEnumerable<T>` | There might be many | Do the step for each one |
| `Task<T>` | It might not be here yet | Wait for it |
| `Result<T>` | It might have failed | Stop at the first failure |

### Sequences

LINQ is where we borrowed the names from. A sequence is a box holding any number of values, and `SelectMany` follows each of them, gathering everything it finds into a single sequence.

```csharp
IEnumerable<Point> points = routes.SelectMany(route => route.Waypoints);
```

With `Select`, that would have been a sequence of lists of points, a box of boxes. It's exactly the flattening we wrote, with a loop where `Maybe<T>` has a check.

### Tasks

A task is a box whose contents may not have arrived. C# has a keyword for following it, which you use every day:

```csharp
Landmark landmark = await FindLandmarkAsync(name);
Route route = await FindRouteAsync(landmark);
Point start = await FindStartAsync(route);
```

Each line waits for one box, then uses what was inside to ask for the next. If we wanted it to look like the others, `SelectMany` for tasks is one line:

```csharp
public static async Task<TResult> SelectMany<T, TResult>(this Task<T> task, Func<T, Task<TResult>> selector) =>
    await selector(await task);
```

So `await` is really a monad with a language feature all to itself. Instead of writing the rest of the method as a function and passing it in, you carry on writing, and the compiler turns what follows into that function.

### Any Monad You Like

It turns out that C# has a similar feature for every other monad. Query syntax isn't only for sequences. The compiler rewrites it as calls to `Select` and `SelectMany`, and works with any type that has them. To allow more than one `from`, it needs one more overload, which takes a second function to combine the values from both steps:

```csharp
public Maybe<TResult> SelectMany<TNext, TResult>(Func<T, Maybe<TNext>> selector, Func<T, TNext, TResult> combine)
    where TNext : notnull
    where TResult : notnull =>
    this.SelectMany(value => selector(value).Select(next => combine(value, next)));
```

Now we can write the hunt like this:

```csharp
Maybe<string> directions =
    from landmark in atlas.FindLandmark(name)
    from route in atlas.FindRoute(landmark)
    from start in atlas.FindStart(route)
    select $"Take {route.Name} from ({start.X}, {start.Y}) to {landmark.Name}";
```

It reads like ordinary code, each `from` opening a box and naming what's inside. It also solves a problem that chaining doesn't: the last line uses `landmark`, `route` and `start` together, and in a chain of `SelectMany` calls the first two would be out of reach by then.

## Optional Values With OnixLabs.Core

There's no need to keep `Maybe<T>`. [OnixLabs.Core](/Products/DotNet#onixlabs-core) has a complete version called `Optional<T>`, with the same shape and many more methods.

```csharp
using OnixLabs.Core;

public interface IAtlas
{
    Optional<Landmark> FindLandmark(string name);

    Optional<Route> FindRoute(Landmark landmark);

    Optional<Point> FindStart(Route route);
}
```

```csharp
public static string Describe(IAtlas atlas, string name) => atlas
    .FindLandmark(name)
    .SelectMany(landmark => atlas.FindRoute(landmark))
    .SelectMany(route => atlas.FindStart(route))
    .Match(
        some: start => $"Start at ({start.X}, {start.Y})",
        none: () => "Nowhere to go");
```

`Describe` hasn't changed at all. Behind it, though, are several things that our version lacked:

- **It's closed.** Nobody can add a third kind of box, so a `switch` that handles `Some<T>` and `None<T>` is known to be complete.
- **There are more ways out.** `GetValueOrDefault` supplies a value of your choice when there isn't one, and `GetValueOrThrow` is there when an empty box would be a bug.
- **It's asynchronous.** `SelectAsync`, `SelectManyAsync` and `MatchAsync` mix optional values with tasks.
- **It compares by value,** as you'd hope.

### `Some` or `Of`?

There are three ways in, and having seen a law broken, you'll be able to tell them apart:

| Way in | `null` | Zero |
|---|---|---|
| `Some` | Throws | `Some` |
| Conversion | `None` | `Some` |
| `Of` | `None` | `None` |

`Optional<T>.Some` is the monad's way in, and it obeys all three laws. The implicit conversion from a value adds one sensible decision, that `null` means nothing, and lets you return a plain value from a method that promises an optional one.

`Optional<T>.Of` is the `Of` we wrote earlier. It deliberately treats zero, and every other type's default value, as missing, which suits the edges of a program, where a lookup that fails hands you zero. Don't use it for a number that's allowed to be zero:

```csharp
Optional<int>.Some(0).HasValue    // True
Optional<int>.Of(0).HasValue      // False
```

## Failure With OnixLabs.Core

An empty box tells you that there's no answer, but not why. `Result<T>` is a box that remembers. It's either a `Success<T>` with a value inside, or a `Failure<T>` with the exception that stopped it.

```csharp
using OnixLabs.Core;

Result<Point> start = Result<string>
    .Of(() => File.ReadAllText("start.txt"))
    .Select(text => text.Split(','))
    .Select(parts => new Point(int.Parse(parts[0]), int.Parse(parts[1])));

string message = start.Match(
    success: point => $"Start at ({point.X}, {point.Y})",
    failure: exception => $"Can't read the start: {exception.Message}");
```

Count the ways that could go wrong. The file might be missing, the comma might be missing, and either half might not be a number. `Result<T>.Of` runs the first step and catches anything it throws. After that, each step runs only if the one before it succeeded, and a step that throws turns into a failure as well. We deal with all of it once, at the end, and we still know exactly what happened.

### The Railway

This is sometimes called **railway-oriented programming**, a name that comes from Scott Wlaschin. Picture two parallel tracks, one for success and one for failure. Every step is a set of points. While things go well, the train stays on the first track. The first failure switches it to the second, where it passes every remaining station without stopping, and arrives at the end with its reason on board.

```plaintext
            Read        Split       Parse
Success ─────●───────────●───────────●─────▶
              \           \           \
Failure ───────●───────────●───────────●───▶
```

### The Small Print

Catching exceptions is convenient, but it bends a law. A function that throws doesn't behave the same inside a chain as it does outside:

```csharp
Func<int, Result<int>> explode = value => throw new InvalidOperationException();

explode(1)                                    // Throws
Result<int>.Success(1).SelectMany(explode)    // Failure
```

Left identity says that those should match. They do for every function that keeps its promise, which is to return its failures rather than throw them. `Result<T>` forgives the ones that don't, and in practice that's nearly always what you want. It's only worth knowing if you move a step out of a chain, and find that an exception you never used to see has somewhere to go.

Why nulls and exceptions cause so much trouble in the first place is a story of its own. It's told in [Billion-Dollar Mistakes and Functional Fixes](/Documentation/DotNet/Billion-Dollar-Mistakes-And-Functional-Fixes).

## Pitfalls

### Opening the Box Too Soon

The commonest mistake is to leave the monad in the middle of a chain, and go back in again.

```csharp
Landmark landmark = atlas.FindLandmark(name).GetValueOrThrow();
Optional<Route> route = atlas.FindRoute(landmark);
```

Everything we gained is gone. The step that can fail has become one that throws, and nothing in the type says so. Stay inside until you have an answer for both cases, and open the box once.

### Boxes of Different Kinds

`SelectMany` goes from one box to another *of the same kind*. An optional landmark can't be followed by a method that returns a result, because the rules between the steps aren't the same. What should happen to an empty box on a railway?

You have to decide, by converting one into the other. Here we say that a missing landmark is a failure, and why:

```csharp
Result<Landmark> landmark = atlas.FindLandmark(name).Match<Result<Landmark>>(
    some: value => value,
    none: () => new KeyNotFoundException($"{name} isn't on the map."));
```

Choose one kind of box for each chain, and convert on the way in.

### Monads for Their Own Sake

A monad earns its place by removing the plumbing between steps. If there's only one step, there's no plumbing to remove.

```csharp
string? label = landmark?.Name.ToUpperInvariant();
```

C#'s `?.` operator follows a reference that might be `null`, and stops if it is. It's the same rule, built into the language, and for a short chain of properties it's hard to beat. Use a monad when the steps are methods of your own, when there are several of them, or when you want the possibility of failure to be visible in a signature.

## About That Definition

Let's go back to the sentence that we set aside:

> A monad is a monoid in the category of endofunctors.

You now know everything that's in it.

An **endofunctor** is, roughly, a box with a `Select`. It turns any type into a boxed type, and turns any function between values into a function between boxes.

A **monoid** is any way of combining two things into one, together with a thing that makes no difference. Adding numbers is a monoid, and the number that makes no difference is zero. Joining strings is another, with the empty string.

So the sentence says that a monad is a box for which you can combine *layers of boxing*. Two layers combine into one, which is the flattening in step 3. The layer that makes no difference is the one you add by putting a value in a box, which is step 1. And the three laws are exactly what it takes to be a monoid: adding nothing on the left changes nothing, adding nothing on the right changes nothing, and it doesn't matter how you group them.

It was a perfectly good explanation all along. It was just written for people who already knew.

## Putting It Together

1. **Look between the steps.** If the same check appears after each one, that's the plumbing a monad can hide.
2. **Wrap once, at the start.** Use `Some` for a value you have, and `Of` when you want defaults to count as missing.
3. **Use `Select` for a plain function, and `SelectMany` for one that returns a box.** If you end up with a box inside a box, you wanted the other one.
4. **Choose the box for its context.** `Optional<T>` when a value might be missing, `Result<T>` when you need to know why, and `Task<T>` when you have to wait.
5. **Stay in until the end.** Open the box once, with `Match`, and deal with both cases.
6. **Don't force it.** One step doesn't need a monad.

A treasure hunt works because nobody has to write "if there's a clue in here" on every clue. The rule is the same for every box, so it's said once, and each clue gets on with telling you where to go.

See [Optional&lt;T&gt;](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.Optional) and [Result&lt;T&gt;](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.Result-T) in the API reference.
