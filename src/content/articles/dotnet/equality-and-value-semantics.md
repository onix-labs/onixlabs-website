---
title: "Equality and Value Semantics"
description: "How equality works in C# classes, structs and records, how to implement IEquatable<T>, why collections break value equality, and how OnixLabs.Core helps."
category: dotnet
order: 1
path: /Documentation/DotNet/Equality-And-Value-Semantics
advert: dotnet
published: 2025-12-15
updated: 2026-11-24
---

## Introduction

Two friends each draw a cross on their own copy of the same map, at exactly the same spot. Are the two crosses the same?

If you're hunting for treasure, yes. Both say to dig in the same place, and it doesn't matter which one you follow. If you're holding an eraser, no. Rub one out, and the other is still there.

Both answers are correct, because they answer different questions. The eraser cares about **identity**: is this the very same thing? The treasure hunter cares about **value**: does this represent the same thing? Every C# type has to choose which question its equality answers. Many types never choose at all. They inherit an answer from the way they were declared, and the bugs appear later: a duplicate in a set, a dictionary lookup that finds nothing, or a test that fails while showing two objects that look exactly alike.

In this article we'll build up from the beginning. We'll see what C# gives you for each kind of type, implement value equality by hand, let records do the work for us, find out where collections undo it all, and finish with the parts of OnixLabs.Core that close the remaining gaps.

We'll use one example throughout, a point on a map. Code samples leave out documentation comments and argument validation for brevity.

## Asking Whether Two Things Are Equal

C# gives us several ways to compare two instances. They don't all ask the same question.

| Mechanism | What it asks |
|---|---|
| `ReferenceEquals(a, b)` | Are these the same object? No type can change the answer. |
| `a.Equals(object)` | Does `a` consider itself equal to this object? Every type inherits this method and may override it. |
| `Equals(a, b)` | The same question, asked safely when either side may be `null`. |
| `a.Equals(T)` | The same question, for one specific type. Declared by `IEquatable<T>`. |
| `a == b` | Whatever the `==` operator for the declared types of `a` and `b` says. |

The last row differs from the others in an important way. `Equals` is a virtual method, so the object itself decides the answer while the program runs. Operators are chosen by the compiler, using the types the variables were *declared* with. The same two objects can therefore give different answers depending on how you refer to them, and we'll see that happen shortly.

### The Equality Contract

Whichever type we're writing, the rest of .NET expects its equality to follow some rules:

- **Reflexive:** a value equals itself.
- **Symmetric:** if `a` equals `b`, then `b` equals `a`.
- **Transitive:** if `a` equals `b`, and `b` equals `c`, then `a` equals `c`.
- **Consistent:** asking again gives the same answer, as long as neither value has changed.
- **Safe with null:** no instance equals `null`, and asking doesn't throw.
- **Matched by its hash code:** if `a` equals `b`, both must return the same result from `GetHashCode`.

The last rule is the one most often broken. Hash-based collections such as `HashSet<T>` and `Dictionary<TKey, TValue>` use the hash code to decide where to look, and only call `Equals` on what they find there. If two equal values return different hash codes, the collection looks in the wrong place and never asks whether they're equal.

The rule only works in that direction. Equal values must share a hash code, but values that share a hash code don't have to be equal. Reading it backwards leads to a bug that we'll come to when we write a hash code of our own.

## Behaviour Semantics and Value Semantics

The contract tells us how equality must behave, but not which kind to choose. The treasure hunter and the eraser were both right, so how do we know which of them a type should agree with? It comes down to what the type is *for*.

- **A type with behaviour semantics exists to do something.** A database connection, a file stream, a message handler: what matters is which one you're holding, because calling it has consequences and it may change as you use it. Its equality is normally based on identity.
- **A type with value semantics exists to mean something.** A point, a date, a colour: what matters is what it says, and any instance that says the same thing will do. Its equality is normally based on value.

A useful test is to imagine quietly swapping one instance for another with the same contents. If nothing in the program could care, it's a value. If something could go wrong, identity matters.

This is a guide rather than a rule, and it's worth asking what a type *represents* instead of what it looks like. The entities you store with Entity Framework Core are a good example. A `Customer` entity is often little more than a list of properties, so it looks like a value. But it represents one particular customer, who remains the same customer after changing their name or moving house. The properties describe the customer at one moment; they don't define who the customer is.

EF Core works the same way. Within a context, it tracks a single instance for each primary key, and it [compares entities by reference](https://learn.microsoft.com/en-us/ef/core/change-tracking/identity-resolution#overriding-object-equality), even if they override `Equals`. A collection of related entities might not, though: a `HashSet<T>` uses your `Equals` unless it's told otherwise, and could treat two separate entities as one. That's why Microsoft recommends leaving entity equality alone, and [avoiding records](https://learn.microsoft.com/en-us/dotnet/csharp/fundamentals/types/records), which compare by value, as entity types. An entity may be made of values, but it isn't one.

## Class Equality

Our `Point` has value semantics, so we know the answer we want: two points at the same spot should be equal. Let's see what C# gives us, starting with a class.

```csharp
public sealed class Point(int x, int y)
{
    public int X { get; } = x;
    public int Y { get; } = y;
}
```

Unless a class says otherwise, its equality is identity. `Equals` and `==` both ask whether two variables refer to the same object.

```csharp
Point first = new(123, 456);
Point second = new(123, 456);
Point alias = first;

first.Equals(second)    // False
first == second         // False
first == alias          // True

HashSet<Point> points = [first, second];
points.Count            // 2
```

As far as C# is concerned, these are two different crosses, and where they are doesn't come into it.

That's the right default for a type with behaviour semantics. Two open database connections aren't interchangeable just because they point at the same server. It's the wrong default for `Point`, which is nothing more than its contents.

## Struct Equality

What happens if we declare `Point` as a struct instead?

```csharp
public readonly struct Point(int x, int y)
{
    public int X { get; } = x;
    public int Y { get; } = y;
}
```

A struct variable holds its data directly, so there's no shared object to have an identity. Structs inherit their equality from `ValueType`, which compares contents.

```csharp
Point first = new(123, 456);
Point second = new(123, 456);

first.Equals(second)    // True
first == second         // Error CS0019: operator '==' cannot be applied
```

The first answer is the one we want, but the default comes with three drawbacks.

- **There are no operators.** Unlike a class, a struct has no `==` or `!=` until you write them.
- **Comparing creates objects.** The inherited `Equals` works with `object`, so the values are boxed: copied into new objects, just to be compared.
- **The rest depends on the fields.** Our `Point` is two integers side by side, which .NET can compare as a block of raw memory. Not every struct is so lucky.

The last of these is easy to miss, because a small change can tip a struct from one side to the other. Suppose our points also need a label:

```csharp
public readonly struct Point(int x, int y, string label)
{
    public int X { get; } = x;
    public int Y { get; } = y;
    public string Label { get; } = label;
}
```

A string can't be compared as raw memory, because what the struct holds is a reference to it. .NET falls back to inspecting the fields one at a time, using reflection, which is much slower. The default hash code suffers too. It never promised to use every field, and today's runtime uses only the first one here:

```csharp
Point cave = new(123, 456, "Cave");
Point beach = new(123, 789, "Beach");

cave.Equals(beach)                           // False
cave.GetHashCode() == beach.GetHashCode()    // True
```

Every point with the same `X` now shares a hash code, whatever its `Y` or its label. A dictionary with those keys still gives correct answers, but it has to search through them one by one, which is exactly what a dictionary exists to avoid. Nothing fails, and nothing warns you. It just gets slower.

So structs begin with the right meaning, but not the right implementation. If a struct is going to be compared, or used as a key, give it an implementation of its own. We'll leave the label behind, and go back to two coordinates.

## Implementing `IEquatable<T>`

`IEquatable<T>` is how a type says, "I know how to compare myself with another `T`." It declares a single method, but a complete implementation has four parts. We'll start from the class and add them one at a time, because each part fixes something the previous one leaves broken.

### Step 1: Compare Values With `Equals(T)`

```csharp
public sealed class Point(int x, int y) : IEquatable<Point>
{
    public int X { get; } = x;
    public int Y { get; } = y;

    public bool Equals(Point? other) => ReferenceEquals(this, other)
        || other is not null
        && this.X == other.X
        && this.Y == other.Y;
}
```

The method reads from top to bottom. An object always equals itself, so we can stop early. Nothing equals `null`. Otherwise, the values decide. `first.Equals(second)` is now true.

### Step 2: Override `Equals(object)`

The new method is only used when the compiler knows that both sides are `Point`. Code that sees a plain `object` still gets the version inherited from `object`, which compares by identity.

```csharp
object boxed = second;

first.Equals(second)    // True
first.Equals(boxed)     // False
```

Two answers for the same pair of objects. We fix that by sending the general method to the specific one, so that there's a single definition of equality.

```csharp
public override bool Equals(object? obj) => this.Equals(obj as Point);
```

If `obj` is something other than `Point`, the `as` operator produces `null`, and step 1 already handles that.

### Step 3: Override `GetHashCode`

The two points are equal now, but they still inherit hash codes based on identity, so a set would almost certainly still hold both. We've broken the last rule of the contract, and the compiler warns us about it. The hash code has to be built from the same values that `Equals` compares.

```csharp
public override int GetHashCode() => HashCode.Combine(this.X, this.Y);
```

```csharp
HashSet<Point> points = [first, second];
points.Count    // 1
```

Hash codes deserve an article of their own, and [they have one](/Documentation/DotNet/HashCode-Algorithms-And-Why-They-Matter).

#### Don't Build `Equals` on `GetHashCode`

Once a type has a hash code, there's a tempting shortcut. If equal values always share a hash code, why not let `Equals` compare hash codes, and avoid listing every property twice? Here's what that looks like, with a hash code that's simpler than ours to make the point, if you'll pardon the pun:

```csharp
public bool Equals(Point? other) => other is not null && this.GetHashCode() == other.GetHashCode();

public override int GetHashCode() => this.X ^ this.Y;
```

```csharp
Point original = new(123, 456);
Point swapped = new(456, 123);

original.GetHashCode() == swapped.GetHashCode()    // True
original.Equals(swapped)                           // True

HashSet<Point> points = [original, swapped];
points.Count                                       // 1
```

It's easy to blame `GetHashCode`. Combining `X` and `Y` with `^` gives the same result whichever way round they are, so these two points were always going to share a hash code. That's called a collision, and it's allowed. Two values that collide take a little longer to tell apart, but nothing breaks, because `Equals` has the final say.

Here, `Equals` has given that job away. It asks the hash code to settle a question that hash codes can't answer, so two different points become equal, and the set throws one of them away.

A better hash code only hides the problem. A `Point` holds 64 bits of data and a hash code has room for 32, so some points must collide, however cleverly it's calculated. The bug would just become rare, and with `HashCode.Combine` it would be harder still to find: its results change each time the program starts, so the points that collide today may not collide tomorrow.

What looks like an easy escape hatch is really a footgun. The fix is to compare the values themselves, as we did in step 1. Do that, and even with this simple hash code, the two points still collide, but they're no longer equal and the set holds both.

A hash code can tell you that two values are *different*. Only `Equals` can tell you that they're the *same*.

### Step 4: Overload the Operators

Finally, `==` still compares identity, so `first.Equals(second)` is true while `first == second` is false. This step is the easiest to forget, because nothing warns you.

```csharp
public static bool operator ==(Point? left, Point? right) => Equals(left, right);

public static bool operator !=(Point? left, Point? right) => !Equals(left, right);
```

The static `Equals(left, right)` deals with `null` on either side, then calls the method from step 2. Everything leads back to step 1.

### The Complete Class

```csharp
public sealed class Point(int x, int y) : IEquatable<Point>
{
    public int X { get; } = x;
    public int Y { get; } = y;

    public bool Equals(Point? other) => ReferenceEquals(this, other)
        || other is not null
        && this.X == other.X
        && this.Y == other.Y;

    public override bool Equals(object? obj) => this.Equals(obj as Point);

    public override int GetHashCode() => HashCode.Combine(this.X, this.Y);

    public static bool operator ==(Point? left, Point? right) => Equals(left, right);

    public static bool operator !=(Point? left, Point? right) => !Equals(left, right);
}
```

Three details are worth pointing out.

- **The properties are read-only.** A hash-based collection remembers where it put a value. If the value changes afterwards, so does its hash code, and the collection can no longer find it.
- **The class is sealed.** If a subclass adds a field and compares it too, the base class may consider itself equal to the subclass while the subclass disagrees, which breaks symmetry. Sealing the class avoids the problem.
- **Operators still follow declared types.** `first == boxed` compares identity even now, because `boxed` is declared as `object`. Use `Equals` when you don't know the type.

### The Same Steps for a Struct

The four parts are the same for a struct, with a little less to do. A struct can't be `null`, and it has no identity, so both of those checks disappear.

```csharp
public readonly struct Point(int x, int y) : IEquatable<Point>
{
    public int X { get; } = x;
    public int Y { get; } = y;

    public bool Equals(Point other) => this.X == other.X && this.Y == other.Y;

    public override bool Equals(object? obj) => obj is Point other && this.Equals(other);

    public override int GetHashCode() => HashCode.Combine(this.X, this.Y);

    public static bool operator ==(Point left, Point right) => left.Equals(right);

    public static bool operator !=(Point left, Point right) => !left.Equals(right);
}
```

All three drawbacks are gone. The operators exist, `Equals(Point)` compares without boxing, and the result no longer depends on what kind of fields we have. If we did bring the label back, we'd add it to `Equals` and `GetHashCode`, and neither would need reflection. `HashSet<T>` and `Dictionary<TKey, TValue>` notice `IEquatable<T>` and use it automatically.

## Record Class Equality

That's a lot of code to say "compare everything". Worse, it has to be kept up to date: add a property, forget to add it to `Equals`, and the type is quietly wrong. Records ask the compiler to write it instead.

```csharp
public sealed record Point(int X, int Y);
```

`record` is short for `record class`. It's still a class, so variables still hold references, but the compiler writes every part of the previous section for us: `IEquatable<Point>`, both `Equals` methods, `GetHashCode` and the operators.

```csharp
Point first = new(123, 456);
Point second = new(123, 456);

first.Equals(second)              // True
first == second                   // True
ReferenceEquals(first, second)    // False
```

Two crosses at the same spot, and a type that knows the difference between the same place and the same ink.

Records also handle inheritance, which we avoided above by sealing the class. Each record carries a hidden property, `EqualityContract`, that identifies its type, and two records are only equal if those match.

```csharp
public record Point(int X, int Y);
public sealed record Point3D(int X, int Y, int Z) : Point(X, Y);

Point flat = new(123, 456);
Point raised = new Point3D(123, 456, 0);

flat == raised    // False
raised == flat    // False
```

Both directions agree, so symmetry holds. Sealing a record that isn't designed for inheritance is still a good habit.

## Record Struct Equality

Structs get the same treatment.

```csharp
public readonly record struct Point(int X, int Y);
```

This gives us the contents-based meaning that structs always had, with the implementation they were missing. The comparison is generated from the fields, so there's no boxing or reflection, every field contributes to the hash code, and `==` and `!=` are included.

Include `readonly` unless you have a reason not to. The properties of a plain `record struct` can be changed after it's created, while those of a `record class` can't.

Here's how the four declarations compare before we write any equality code ourselves:

| Declaration | `Equals` compares | `==` compares |
|---|---|---|
| `class` | Identity | Identity |
| `struct` | Fields, sometimes by reflection | Not available |
| `record class` | Type and fields | Type and fields |
| `record struct` | Fields | Fields |

For a small value such as `Point`, a `readonly record struct` is a natural fit, and it's the version we'll use from here.

## Pitfalls When Comparing Collections

Records compare their fields, so it's tempting to conclude that a record compares *everything* inside it. Let's give `Point` something to live in: a route between points, which may or may not have been planned yet.

```csharp
public sealed record Route(string Name, IReadOnlyList<Point>? Waypoints);
```

```csharp
Route first = new("Treasure", [new(123, 456), new(789, 12)]);
Route second = new("Treasure", [new(123, 456), new(789, 12)]);

first == second    // False
```

The same name and the same waypoints, yet the routes aren't equal. The record kept its promise and compared each field using that field's own equality. The trouble is the field.

### Most Collections Compare by Identity

Arrays, lists, sets and dictionaries are all classes, and they follow the default for classes. Being immutable doesn't change that.

| Type | Two instances are equal when |
|---|---|
| `T[]`, `List<T>` | They're the same object |
| `HashSet<T>`, `Dictionary<TKey, TValue>` | They're the same object |
| `ImmutableList<T>`, `ImmutableHashSet<T>`, `FrozenSet<T>` | They're the same object |
| `ImmutableArray<T>` | They wrap the same underlying array |
| `ReadOnlyMemory<T>`, `ReadOnlySpan<T>` | They cover the same region of memory |
| `string` | They contain the same characters |

Hash codes follow the same pattern, so a `HashSet<Route>` containing `first` doesn't find `second` either.

### Copies Share Their Collections

The opposite mistake is just as easy to make. A `with` expression copies the fields of a record, and a collection field is only a reference, so the original and the copy end up with the same list.

```csharp
List<Point> waypoints = [new(123, 456)];

Route original = new("Treasure", waypoints);
Route shortcut = original with { Name = "Shortcut" };

waypoints.Add(new(789, 12));

original.Waypoints?.Count    // 2
shortcut.Waypoints?.Count     // 2
```

`IReadOnlyList<T>` doesn't prevent this. It means that *you* can't change the list through that property, not that nobody can.

### `SequenceEqual` Doesn't Like `null`

LINQ's `SequenceEqual` compares two sequences one element at a time, which is the comparison we wanted. It doesn't accept `null` on either side, though, and our waypoints may be `null`.

```csharp
IReadOnlyList<Point>? planned = [new(123, 456)];
IReadOnlyList<Point>? unplanned = null;

planned.SequenceEqual(unplanned)      // Throws ArgumentNullException
unplanned.SequenceEqual(unplanned)    // Throws ArgumentNullException
```

With nullable reference types enabled, the compiler warns about both calls. Ignore the warning, and two routes with the same name and nothing planned, which ought to be equal, throw when they're compared. The contract doesn't allow that.

### Order, Nesting and Lazy Queries

- **Order matters to a sequence.** `[1, 2, 3]` and `[3, 2, 1]` are different sequences. For waypoints that's correct, but a set has no meaningful order, so compare sets with `SetEquals`. Dictionaries have no meaningful order either, so compare their counts, then look up each key.
- **Nested collections fall back to identity.** `SequenceEqual` on two `int[][]` values compares the inner arrays, which are the same only if they're the same object.
- **Not every sequence is stored.** A LINQ query runs again each time it's read, so an `IEnumerable<T>` field may do a lot of work in `Equals`, or give a different answer each time. Store a list or an array instead.

### The Hash Code Has to Follow

Suppose we fix `Equals` so that it looks inside the collection, and write the obvious hash code to go with it:

```csharp
public override int GetHashCode() => HashCode.Combine(this.Name, this.Waypoints);
```

This compiles, reads well, and is wrong. `HashCode.Combine` asks the list for its hash code, and the list answers with its identity. Equal routes now return different hash codes, and we're back to a set that can't find what it contains. If `Equals` looks inside a collection, `GetHashCode` must look inside it too.

## Comparing Collections With OnixLabs.Core.Linq

None of these problems is hard to solve once. What's hard is remembering to solve all of them, every time. The `OnixLabs.Core.Linq` namespace in [OnixLabs.Core](/Products/DotNet#onixlabs-core) provides a matching pair of methods, one for each half of the contract.

`SequenceEqualOrNull` compares two sequences element by element, and accepts `null` on either side.

| Left | Right | Result |
|---|---|---|
| `null` | `null` | `true` |
| `null` | Any sequence, even an empty one | `false` |
| Any sequence, even an empty one | `null` | `false` |
| A sequence | A sequence | `true` if they have the same elements in the same order |

Notice that `null` and empty are different. For our route, "not planned yet" and "planned, with nowhere to stop on the way" shouldn't be confused.

`GetContentHashCode` builds a hash code from the elements, and returns zero for `null`. With both, the route becomes:

```csharp
using OnixLabs.Core.Linq;

public sealed record Route(string Name, IReadOnlyList<Point>? Waypoints)
{
    public IReadOnlyList<Point>? Waypoints { get; } = Waypoints is null ? null : [..Waypoints];

    public bool Equals(Route? other) => ReferenceEquals(this, other)
        || other is not null
        && this.Name == other.Name
        && this.Waypoints.SequenceEqualOrNull(other.Waypoints);

    public override int GetHashCode() => HashCode.Combine(this.Name, this.Waypoints.GetContentHashCode());
}
```

We only replace the two parts that were wrong. The compiler still writes the rest, and its `Equals(object)`, `==` and `!=` all lead to our `Equals`. We've also taken a copy of the waypoints, so nobody holding the original list can change the route, or its hash code, after it's been created.

```csharp
Route first = new("Treasure", [new(123, 456), new(789, 12)]);
Route second = new("Treasure", [new(123, 456), new(789, 12)]);

first == second            // True

HashSet<Route> routes = [first];
routes.Contains(second)    // True
```

The comparison works across collection types, so an array equals a list with the same contents. `SequenceEqualOrNull` also accepts an `IEqualityComparer<T>` when the elements need a different rule:

```csharp
IReadOnlyList<string> lower = ["cave", "beach"];
IReadOnlyList<string> upper = ["CAVE", "BEACH"];

lower.SequenceEqualOrNull(upper)                                      // False
lower.SequenceEqualOrNull(upper, StringComparer.OrdinalIgnoreCase)    // True
```

If you pass a comparer to `SequenceEqualOrNull` inside `Equals`, the hash code has to follow the same rule. `GetContentHashCode` uses each element's own hash code, so in that case you'd build it yourself, using the `HashCode.Add` overload that accepts a comparer.

Both methods respect order, and both use each element's own equality. They're for sequences rather than sets, and nested collections still need elements that compare by value. One way to arrange that is to wrap the inner collection in a type like `Route`.

## Completing the Contract With `IValueEquatable<T>`

There's one gap left. `IEquatable<T>` promises an `Equals` method and nothing more. It doesn't mention operators, and that causes trouble in two places.

The first is step 4 of our implementation. Forget the operators on a class, and it compiles without complaint while `Equals` and `==` disagree.

The second is generic code. Suppose we want to count how many times a value appears:

```csharp
public static int CountOf<T>(this IEnumerable<T> values, T target) where T : IEquatable<T> =>
    values.Count(value => value == target);    // Error CS0019: operator '==' cannot be applied
```

The compiler can't use an operator that the interface doesn't promise. It's tempting to add a `class` constraint, which makes the error go away:

```csharp
public static int CountOf<T>(this IEnumerable<T> values, T target) where T : class, IEquatable<T> =>
    values.Count(value => value == target);    // Compiles, but compares identity
```

This is worse. Operators are chosen at compile time, and all the compiler knows about `T` is that it's a class, so it picks the comparison that every class has. That's true even when `T` is a record, or a class with operators as carefully written as ours.

OnixLabs.Core provides `IValueEquatable<T>`, which extends `IEquatable<T>` and requires both operators:

```csharp
public interface IValueEquatable<T> : IEquatable<T> where T : IValueEquatable<T>
{
    public static abstract bool operator ==(T? left, T? right);

    public static abstract bool operator !=(T? left, T? right);
}
```

On our class, only the declaration changes. The operators we wrote in step 4 now satisfy the interface, and leaving them out is an error rather than a surprise.

```csharp
using OnixLabs.Core;

public sealed class Point(int x, int y) : IValueEquatable<Point>
{
    public int X { get; } = x;
    public int Y { get; } = y;

    public bool Equals(Point? other) => ReferenceEquals(this, other)
        || other is not null
        && this.X == other.X
        && this.Y == other.Y;

    public override bool Equals(object? obj) => this.Equals(obj as Point);

    public override int GetHashCode() => HashCode.Combine(this.X, this.Y);

    public static bool operator ==(Point? left, Point? right) => Equals(left, right);

    public static bool operator !=(Point? left, Point? right) => !Equals(left, right);
}
```

Records already have the operators, so they only need to name the interface:

```csharp
public readonly record struct Point(int X, int Y) : IValueEquatable<Point>;
```

Generic code can now use `==` and get value equality, for classes, structs and records alike:

```csharp
public static int CountOf<T>(this IEnumerable<T> values, T target) where T : IValueEquatable<T> =>
    values.Count(value => value == target);
```

If your values also have an order, `IValueComparable<T>` does the same job for `IComparable<T>`, requiring `<`, `<=`, `>` and `>=` as well. Across the ONIXLabs .NET libraries, `Optional<T>`, `Result<T>`, `BigDecimal` and the cryptographic primitives all implement `IValueEquatable<T>`, so they all compare the same way.

## Putting It Together

Here's the finished model, with everything we've covered:

```csharp
using OnixLabs.Core;
using OnixLabs.Core.Linq;

public readonly record struct Point(int X, int Y) : IValueEquatable<Point>;

public sealed record Route(string Name, IReadOnlyList<Point>? Waypoints) : IValueEquatable<Route>
{
    public IReadOnlyList<Point>? Waypoints { get; } = Waypoints is null ? null : [..Waypoints];

    public bool Equals(Route? other) => ReferenceEquals(this, other)
        || other is not null
        && this.Name == other.Name
        && this.Waypoints.SequenceEqualOrNull(other.Waypoints);

    public override int GetHashCode() => HashCode.Combine(this.Name, this.Waypoints.GetContentHashCode());
}
```

And here's how to decide what your own types need:

1. **Decide which question the type answers.** If two instances with the same contents are still different things, use a class and keep identity. That includes entities, however much they look like values.
2. **If it's a value, start with a record.** Use a `readonly record struct` for something small, and a `sealed record` otherwise.
3. **Write it by hand when you need control.** Implement `Equals(T)`, `Equals(object)`, `GetHashCode` and both operators, all leading back to one definition.
4. **Look for collections.** If the type holds one, replace `Equals` and `GetHashCode` together, using `SequenceEqualOrNull` and `GetContentHashCode`.
5. **Keep it immutable.** A value that can change is a key that can be lost.
6. **Implement `IValueEquatable<T>`,** so that the operators can't be forgotten and generic code can rely on them.

Now both the treasure hunter and the eraser get the right answer.

See [IValueEquatable&lt;T&gt;](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.IValueEquatable) and [IValueComparable&lt;T&gt;](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.IValueComparable) in the API reference.
