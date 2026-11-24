---
title: "HashCode Algorithms and Why They Matter"
description: "How hash-based collections use GetHashCode, why collisions happen, how good algorithms avoid them, and how to hash values, collections and sets in C#."
category: dotnet
order: 2
path: /Documentation/DotNet/HashCode-Algorithms-And-Why-They-Matter
advert: dotnet
published: 2025-12-15
updated: 2026-11-24
---

## Introduction

Picture a village sorting office with a wall of pigeonholes, one for each letter of the alphabet. A letter arrives for Mrs Harris, and the sorter drops it under H. When she comes to collect it, nobody searches the whole wall. The sorter goes straight to H, flicks through the few letters there, and reads the name on each until they find hers.

Two things make that work. The first is a quick rule that turns a name into a pigeonhole. The second is the name on the envelope, which settles the matter when a pigeonhole holds more than one letter.

That's how `HashSet<T>` and `Dictionary<TKey, TValue>` work too. The quick rule is `GetHashCode`, and the name on the envelope is `Equals`. A good rule spreads the letters evenly, so there are only ever a few to look through. A bad one sends the whole village to H.

In this article we'll look at what a hash code is for, why collisions can't be avoided, and what separates a good algorithm from a bad one, by measuring several of them. Then we'll see what .NET gives you, where hash codes go wrong, and how to hash things that hold collections.

It follows on from [Equality and Value Semantics](/Documentation/DotNet/Equality-And-Value-Semantics), and we'll keep its example, a point on a map. As before, code samples leave out documentation comments and argument validation for brevity.

## What a Hash Code Is For

A hash code is a 32-bit integer that summarises a value. Its job is to let a collection find that value without comparing it with everything else.

Simplified a little, a hash-based collection keeps an array of pigeonholes, and works out which one a value belongs in from its hash code:

```csharp
int hashCode = value.GetHashCode();
int pigeonhole = (int)((uint)hashCode % (uint)pigeonholes.Length);
```

To find the value again, it repeats the sum, goes to that pigeonhole, and looks through what's there. It skips anything with a different hash code, and calls `Equals` on the rest.

Notice how the work is divided. The hash code **narrows** the search, and `Equals` **decides** it. That's why a hash code doesn't have to be unique, and why it should never be used to decide whether two values are equal. The previous article shows what happens when [`Equals` is built on `GetHashCode`](/Documentation/DotNet/Equality-And-Value-Semantics#dont-build-equals-on-gethashcode).

### The Rules

Two rules must hold, or the collection stops working:

- **Equal values have equal hash codes.** Otherwise, the collection looks in the wrong pigeonhole.
- **A value's hash code doesn't change while it's in a collection.** Otherwise, it's in the wrong pigeonhole already.

Three more decide whether it works *well*:

- **Different values usually have different hash codes.** The more that share one, the longer the search.
- **It's quick to calculate.** It happens on every lookup, so it shouldn't cost more than it saves.
- **It doesn't throw.** Nobody expects looking something up to fail.

## Why Collisions Are Inevitable

When two different values have the same hash code, that's a **collision**. It's tempting to think that a clever enough algorithm could avoid them altogether, but it can't.

A `Point` has two 32-bit coordinates, so there are 2<sup>64</sup> possible points. A hash code has 32 bits, so there are only 2<sup>32</sup>, or about 4.3 billion, of those. Even if the points were shared out perfectly evenly, each hash code would stand for more than four billion of them. Mathematicians call this the pigeonhole principle: with more letters than pigeonholes, somebody has to share.

Collisions also turn up sooner than you'd expect. With hash codes spread perfectly at random, you only need about 77,000 values for an even chance that two of them collide. It's the same surprise as finding that, in a room of 23 people, two probably share a birthday.

So the aim isn't to prevent collisions. It's to keep them rare, and to stop them following a pattern that your data happens to follow too.

## Measuring a Hash Code

How much difference does the algorithm make? Let's find out. We'll take every point on a 100 by 100 grid, which gives us 10,000 different points, and add them all to a `HashSet<Point>`. Then we'll count two things: how many different hash codes they produce, and how many times the set has to call `Equals`.

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

    public override int GetHashCode() => /* To be decided */;
}
```

### One Pigeonhole for Everybody

The simplest hash code that obeys the rules that must hold is a constant.

```csharp
public override int GetHashCode() => 1;
```

Equal points have equal hash codes, and the hash code never changes. Every answer the set gives is correct. But every point is in the same pigeonhole, so adding one means comparing it with all of those already there. Filling the set calls `Equals` **49,995,000 times**.

### Combining the Coordinates

A constant ignores the coordinates, so let's use them. Here are three obvious ways to make one number out of two:

```csharp
public override int GetHashCode() => this.X ^ this.Y;

public override int GetHashCode() => this.X + this.Y;

public override int GetHashCode() => this.X * this.Y;
```

| Algorithm | Different hash codes | Calls to `Equals` |
|---|---|---|
| Constant | 1 | 49,995,000 |
| `X ^ Y` | 128 | 392,856 |
| `X + Y` | 199 | 328,350 |
| `X * Y` | 2,870 | 40,040 |

Each is a great improvement, but 10,000 points are still sharing a few hundred or a few thousand hash codes. Two things are going wrong.

**They're symmetric.** Swapping `X` and `Y` doesn't change the result, so (123, 456) always collides with (456, 123). Each algorithm has blind spots of its own as well. `X ^ Y` is zero for every point on the diagonal, because a number combined with itself cancels out. `X * Y` is zero for every point on either axis.

**They don't spread.** Small coordinates give small results. Our coordinates only go up to 99, so `X + Y` can't be more than 198, and more than four billion other hash codes go unused.

### Multiplying by a Prime

We can break the symmetry by treating the coordinates differently. The traditional way is to multiply by a small prime number at each step.

```csharp
public override int GetHashCode() => unchecked((17 * 31 + this.X) * 31 + this.Y);
```

Now the order matters, and the results spread further. Our grid gives **3,169** different hash codes and **11,234** calls to `Equals`, or about one comparison for each point.

There's still a pattern, though. Moving one step along `X` adds 31, and moving 31 steps back along `Y` takes it away again, so (1, 31) collides with (2, 0). Whenever the coordinates range further than the multiplier, the rows overlap.

The `unchecked` keyword matters here. Hash codes are expected to overflow, wrapping around from the largest integer to the smallest. Without it, a project that checks for overflow would throw an exception for points that are far enough away, and `GetHashCode` shouldn't throw.

## The FNV Algorithm

What we want is for a small change anywhere in the value to change the whole hash code. One of the simplest algorithms that comes close is **FNV**, named after its authors, Glenn **F**owler, Landon Curt **N**oll and Kiem-Phong **V**o.

It reads a value one byte at a time. The variant usually recommended, FNV-1a, starts with a number called the **offset basis**. For each byte, it combines the byte with the hash so far using exclusive-or, then multiplies by a **prime**.

```plaintext
hash = offset basis
for each byte
    hash = hash ^ byte
    hash = hash * prime
return hash
```

FNV-1, the original, does the multiplication first. Swapping the two steps means that the last byte gets multiplied as well, so it affects more of the result.

In C#, the 32-bit version takes only a few lines:

```csharp
public static uint Fnv1a(ReadOnlySpan<byte> bytes)
{
    const uint offsetBasis = 2166136261;
    const uint prime = 16777619;

    uint hash = offsetBasis;

    foreach (byte value in bytes)
        hash = unchecked((hash ^ value) * prime);

    return hash;
}
```

Both constants come from the algorithm's definition. The prime is chosen so that each multiplication carries the byte's effect up into the higher bits, and the next byte mixes with the result. That's what the earlier algorithms were missing.

To use it, we write the point's coordinates out as bytes:

```csharp
public override int GetHashCode()
{
    Span<byte> bytes = stackalloc byte[8];

    BinaryPrimitives.WriteInt32LittleEndian(bytes, this.X);
    BinaryPrimitives.WriteInt32LittleEndian(bytes[4..], this.Y);

    return unchecked((int)Fnv1a(bytes));
}
```

Our grid now gives **10,000** different hash codes for 10,000 points, and the set doesn't need to call `Equals` at all.

## What .NET Gives You

FNV is worth understanding, but you'll rarely need to write it. .NET has had an answer of its own since .NET Core 2.1.

### `HashCode.Combine`

```csharp
public override int GetHashCode() => HashCode.Combine(this.X, this.Y);
```

`HashCode.Combine` accepts up to eight values, of any types, and handles `null`. It creates no objects of its own, and mixes its inputs thoroughly. On our grid it does as well as FNV:

| Algorithm | Different hash codes | Calls to `Equals` |
|---|---|---|
| Constant | 1 | 49,995,000 |
| `X ^ Y` | 128 | 392,856 |
| `X + Y` | 199 | 328,350 |
| `X * Y` | 2,870 | 40,040 |
| Prime | 3,169 | 11,234 |
| FNV-1a | 10,000 | 0 |
| `Combine` | 10,000 | 0 |

The last row isn't quite a guarantee, because `HashCode.Combine` starts from a random number each time the program runs. Two of our 10,000 points could collide, but you'd expect that to happen about once in every ninety runs.

For more than eight values, or a number you don't know in advance, create a `HashCode` and add to it:

```csharp
HashCode hash = new();

foreach (Point point in points)
    hash.Add(point);

return hash.ToHashCode();
```

### Letting the Compiler Do It

Often you don't need to write anything. Records, tuples and anonymous types all come with a hash code that uses every field.

```csharp
public readonly record struct Point(int X, int Y);
```

You may come across code that borrows this, by putting its fields into an anonymous type and asking for *its* hash code:

```csharp
public override int GetHashCode() => new { this.X, this.Y }.GetHashCode();
```

It works, and spreads well, but it creates an object every time, only to throw it away. Before `HashCode` existed, that was a fair trade. Now there's no reason to make it. A tuple, `(this.X, this.Y).GetHashCode()`, gives a good result without creating an object, but `HashCode.Combine` says more clearly what you mean.

We'll use the record struct from here.

## Keeping Up With `Equals`

Everything so far has been about quality. Now for the rules that can't be broken, and the first is that equal values have equal hash codes.

That's easy when a type compares its fields in the ordinary way. It's just as easy to break when it doesn't. Here's a type that wraps a single value, the name of a place, and ignores case when it compares:

```csharp
public sealed record PlaceName(string Value)
{
    public bool Equals(PlaceName? other) =>
        other is not null && string.Equals(this.Value, other.Value, StringComparison.OrdinalIgnoreCase);

    public override int GetHashCode() => this.Value.GetHashCode();
}
```

The hash code looks right, but it's the string's own, and that *does* depend on case.

```csharp
PlaceName lower = new("Smugglers' Cove");
PlaceName upper = new("SMUGGLERS' COVE");

lower.Equals(upper)    // True

HashSet<PlaceName> names = [lower, upper];
names.Count            // 2
```

The set holds two values that claim to be equal. Whatever rule `Equals` follows, `GetHashCode` has to follow it too. For a type with a single value, that means hashing that value in the same way:

```csharp
public override int GetHashCode() => this.Value.GetHashCode(StringComparison.OrdinalIgnoreCase);
```

Now the set holds one. This is also a good reason to wrap a value in a type of its own. The rule lives in one place, and everything built on it is right without trying:

```csharp
public sealed record Landmark(PlaceName Name, Point Position);
```

If `Landmark` held a plain string instead, it would have to apply the rule itself. `HashCode.Add` accepts a comparer for exactly this:

```csharp
public override int GetHashCode()
{
    HashCode hash = new();

    hash.Add(this.Name, StringComparer.OrdinalIgnoreCase);
    hash.Add(this.Position);

    return hash.ToHashCode();
}
```

### Nearly Equal Isn't Equal

There's one kind of equality that can't be hashed at all. Suppose we decide that two points are equal if they're within one step of each other. Then (1, 0) equals (2, 0), and (2, 0) equals (3, 0), so each pair must share a hash code. But that makes (1, 0) and (3, 0) share one too, and so on along the whole row, and every other row. Only a constant would do.

The fault isn't in the hash code. Being nearly equal isn't transitive, so it was never a valid definition of equality. Give it a method of its own, such as `IsNear`, and leave `Equals` alone.

### Equality From Outside

Collections don't have to use a type's own equality. You can hand them an `IEqualityComparer<T>`, which supplies both halves together:

```csharp
HashSet<string> names = new(StringComparer.OrdinalIgnoreCase) { "Smugglers' Cove" };

names.Contains("SMUGGLERS' COVE")    // True
```

If you write a comparer of your own, the same rules apply to its `Equals` and `GetHashCode`.

## Keeping Still

The second rule that can't be broken is that a hash code doesn't change while its value is in a collection. Here's a point that can be moved:

```csharp
public sealed class MovablePoint : IEquatable<MovablePoint>
{
    public int X { get; set; }
    public int Y { get; set; }

    public bool Equals(MovablePoint? other) => other is not null && this.X == other.X && this.Y == other.Y;

    public override bool Equals(object? obj) => this.Equals(obj as MovablePoint);

    public override int GetHashCode() => HashCode.Combine(this.X, this.Y);
}
```

```csharp
MovablePoint point = new() { X = 123, Y = 456 };
HashSet<MovablePoint> points = [point];

points.Contains(point)    // True

point.X = 0;

points.Contains(point)    // False
points.Remove(point)      // False
points.Count              // 1
```

The set says that it doesn't contain the point, and it can't remove it either. It's still in there, filed under a hash code that it no longer has, like a letter whose name was changed after it was sorted.

The best fix is to make values immutable. If an object really has to change, it probably has an identity rather than a value, and should keep the hash code it inherits.

## Hashing Collections

Our points now hash well, so let's put some together. A route is a name and a list of waypoints:

```csharp
public sealed record Route(string Name, IReadOnlyList<Point>? Waypoints);
```

### Collections Hash by Identity

The compiler gives `Route` a hash code that combines its fields, and that's the problem. Arrays and most collections don't override `GetHashCode`, so they hash by identity, just as they compare by identity. `HashCode.Combine` doesn't look inside them either.

```csharp
int[] first = [1, 2, 3];
int[] second = [1, 2, 3];

HashCode.Combine(first) == HashCode.Combine(second)    // False
```

[OnixLabs.Core](/Products/DotNet#onixlabs-core) provides `GetContentHashCode`, which hashes the elements of any `IEnumerable<T>` in order, and returns zero for `null`:

```csharp
using OnixLabs.Core.Linq;

first.GetContentHashCode() == second.GetContentHashCode()    // True
```

It's designed to be used with `SequenceEqualOrNull`, so that both halves look inside the collection in the same way:

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

The elements need good hash codes of their own. `GetContentHashCode` on an array of arrays would hash the inner arrays by identity.

### Hashing Bytes

Binary data is worth treating separately, because hashing it one byte at a time is slow. OnixLabs.Core has another `GetContentHashCode` for `ReadOnlySpan<byte>`, which hashes several bytes at a time without creating any objects:

```csharp
using OnixLabs.Core;
using OnixLabs.Core.Linq;

public sealed record MapTile(Point Position, byte[] Image)
{
    public bool Equals(MapTile? other) => ReferenceEquals(this, other)
        || other is not null
        && this.Position == other.Position
        && this.Image.SequenceEqualOrNull(other.Image);

    public override int GetHashCode() => HashCode.Combine(this.Position, new ReadOnlySpan<byte>(this.Image).GetContentHashCode());
}
```

Take care not to mix the two. They calculate the hash code differently, so the same bytes can give one result as a span and another as an `IEnumerable<byte>`. Within a type that isn't a problem, so long as it always uses the same one.

### When Order Doesn't Matter

`GetContentHashCode` and `HashCode` both depend on order. That's right for a route, but a set has no order, and two sets holding the same points may list them differently. We need a hash code that comes out the same whichever way round we go.

Adding the elements' hash codes together does that, because addition doesn't care about order. We criticised `X + Y` for being symmetric. Here, symmetric is exactly what we want.

```csharp
public sealed record Region
{
    private readonly FrozenSet<Point> points;

    public Region(IEnumerable<Point> points) => this.points = points.ToFrozenSet();

    public bool Equals(Region? other) => ReferenceEquals(this, other) || other is not null && this.points.SetEquals(other.points);

    public override int GetHashCode()
    {
        int total = 0;

        foreach (Point point in this.points)
            total = unchecked(total + HashCode.Combine(point));

        return total;
    }
}
```

Why `HashCode.Combine(point)`, rather than `point.GetHashCode()`? Because of what's being added. The hash code that the compiler currently writes for our `Point` multiplies `X` by a constant and adds `Y`. Add several of those together, and you get the total of the `X` values multiplied by the constant, plus the total of the `Y` values. So any two sets whose coordinates have the same totals collide:

```csharp
int first = new Point(0, 0).GetHashCode() + new Point(1, 1).GetHashCode();
int second = new Point(0, 1).GetHashCode() + new Point(1, 0).GetHashCode();

first == second    // True
```

Passing each one through `HashCode.Combine` first scrambles it, so that the pattern doesn't survive the addition. The same approach works for a dictionary, using `HashCode.Combine(key, value)` for each entry.

## Don't Keep Them

A hash code is for looking things up while your program is running, and for nothing else. The random starting point that `HashCode` uses is there to make sure of it, and strings have one too. Run this program twice, and you'll see different numbers the second time:

```csharp
Console.WriteLine(HashCode.Combine(123, 456));
Console.WriteLine("Smugglers' Cove".GetHashCode());
```

That's partly a defence. If the results could be predicted, an attacker could send a web application thousands of values that all share a hash code, and slow its dictionaries to a crawl. It's also a way for .NET to keep its options open, because an algorithm that nobody can depend on is one that can be improved.

Some hash codes happen to be the same every time. An integer's is itself, and a record struct of integers is calculated from those. Don't rely on that either, because nothing promises that it will stay true.

So never save a hash code in a file or a database, send it to another machine, or use it as an identifier. If you need a result that you can keep, choose an algorithm by name:

- **To tell data apart quickly,** such as deciding which server should hold a record, an algorithm with a published definition will do. The `Fnv1a` method we wrote always gives the same answer for the same bytes.
- **To be sure that data hasn't been changed,** use a cryptographic hash. FNV and `HashCode` offer no protection at all, because it's easy to find two values that collide.

For the second, .NET provides the algorithms, and [OnixLabs.Security](/Products/DotNet/Security) wraps the result in a type with value semantics, so it can't be mistaken for any other array of bytes:

```csharp
using OnixLabs.Security.Cryptography;

using SHA256 algorithm = SHA256.Create();

Hash hash = Hash.Compute(algorithm, Encoding.UTF8.GetBytes("Smugglers' Cove"));
```

## Putting It Together

Here's our map, with everything hashed as it should be:

```csharp
using OnixLabs.Core;
using OnixLabs.Core.Linq;

public readonly record struct Point(int X, int Y) : IValueEquatable<Point>;

public sealed record PlaceName(string Value) : IValueEquatable<PlaceName>
{
    public bool Equals(PlaceName? other) =>
        other is not null && string.Equals(this.Value, other.Value, StringComparison.OrdinalIgnoreCase);

    public override int GetHashCode() => this.Value.GetHashCode(StringComparison.OrdinalIgnoreCase);
}

public sealed record Landmark(PlaceName Name, Point Position) : IValueEquatable<Landmark>;

public sealed record Route(PlaceName Name, IReadOnlyList<Point>? Waypoints) : IValueEquatable<Route>
{
    public IReadOnlyList<Point>? Waypoints { get; } = Waypoints is null ? null : [..Waypoints];

    public bool Equals(Route? other) => ReferenceEquals(this, other)
        || other is not null
        && this.Name == other.Name
        && this.Waypoints.SequenceEqualOrNull(other.Waypoints);

    public override int GetHashCode() => HashCode.Combine(this.Name, this.Waypoints.GetContentHashCode());
}
```

`Point` and `Landmark` need no code at all. `PlaceName` follows its own rule about case, and `Route` looks inside its collection. Each type takes care of itself, and the types built from it benefit.

When you write a hash code of your own:

1. **Let the compiler do it if you can.** Records and tuples already use every field.
2. **Otherwise, use `HashCode.Combine`.** Reach for `HashCode.Add` when you need a comparer, or have more than eight values.
3. **Change `Equals` and `GetHashCode` together.** Whatever `Equals` ignores, `GetHashCode` must ignore too.
4. **Hash only what can't change.** A value that moves is a value that can be lost.
5. **Look inside collections.** Use `GetContentHashCode` when order matters, and add scrambled hash codes together when it doesn't.
6. **Expect collisions.** Let the hash code narrow the search, and let `Equals` decide.
7. **Don't keep hash codes.** When you need one that lasts, choose an algorithm by name.

The sorter never needed a pigeonhole for every villager. They only needed a rule that spread the letters out, and the good sense to read the name on the envelope.

See [ReadOnlySpanExtensions](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.ReadOnlySpanExtensions) and [IEnumerableExtensions](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.Linq.IEnumerableExtensions) in the API reference.
