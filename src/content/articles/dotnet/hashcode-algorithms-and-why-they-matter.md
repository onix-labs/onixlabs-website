---
title: "HashCode Algorithms and Why They Matter"
navigationTitle: "HashCode Algorithms and Why They Matter"
description: "Why GetHashCode matters, how hash collisions happen, how to implement a hash algorithm such as FNV, and how to hash collections by their content."
category: dotnet
order: 2
path: /Documentation/DotNet/HashCode-Algorithms-And-Why-They-Matter
published: 2025-12-15
---

## Introduction

In this article we’re going to understand how to generate hash codes for custom type implementations, identifying suitable hashing algorithms and considerations.

The root of the .NET type hierarchy, `System.Object` implements a method called [GetHashCode](https://msdn.microsoft.com/en-us/library/system.object.gethashcode\(v=vs.110\).aspx). A hash code is a deterministic, numeric value that is used to insert and identify an object in a hash-based collection, such as `Dictionary<TKey, TValue>` or `HashSet<T>`. The `GetHashCode` method provides hash codes for algorithms that need quick checks for object equality.

### Understanding Collisions

Objects that are equal by value should return equal hash codes, however the reverse is not true; hash codes do not imply object equality because objects that are not equal by value can return identical hash codes. This is known as a collision.

The following example deliberately implements `GetHashCode` poorly to demonstrate a collision, where objects are equal by hash, but not by their underlying values.

```csharp
public readonly struct Point(int x, int y) : IEquatable<Point>
{

    public int X => x;
    public int Y => y;

    public bool Equals(Point other) => 
        X == other.X && 
        Y == other.Y;

    public override int GetHashCode() => X * Y; // The symmetry here causes a collision.
}
```

Notice that `GetHashCode` simply multiplies `X` by `Y` therefore simply swapping the values of `X` and `Y` would yield a hash collision; for example:

```csharp
Point point1 = new Point(123, 456);
Point point2 = new Point(456, 123);

point1.Equals(point2);                           // False
point1.GetHashCode() == point2.GetHashCode();    // True
```

In reality we wouldn’t implement hash algorithms that collide so easily, though it’s impossible to prevent collisions because of the finite number of hashes that can be created. `GetHashCode` returns a 32-bit signed integer value, therefore the maximum number of unique hashes before collision would occur is 4,294,967,295 or approximately 4.2 billion.

A good hashing algorithm should provide a low rate of collision and an even distribution over the specified bit-ness.

### Hashing via Anonymous Types

Anonymous types have been part of C# since version 3.0. Under the hood, anonymous objects implement a relatively good hashing algorithm. This is probably the simplest way to implement a `GetHashCode` implementation for a custom type.

```csharp
public readonly struct Point(int x, int y) : IEquatable<Point>
{
    public int X => x;
    public int Y => y;

    public bool Equals(Point other) =>
        X == other.X && 
        Y == other.Y;

    public override int GetHashCode() => new { X, Y }.GetHashCode();
}
```

Notice that `GetHashCode` rolls the `X` and `Y` properties into a new anonymous object and returns the anonymous object's `GetHashCode` result.

```csharp
Point point1 = new Point(123, 456);
Point point2 = new Point(456, 123);

point1.Equals(point2);                           // False
point1.GetHashCode() == point2.GetHashCode();    // False
```

While this implementation is very effective, the only caveat is that there is some overhead with creating new anonymous objects, which could cause some performance issues with large hashed collections.

### The FNV Hashing Algorithm

The FNV hash algorithm was designed by and named after Glenn **Fowler**, Langdon **Noll** and Phong **Vo**. The algorithm only uses multiplication and exclusive-OR operations, and therefore its speed allows large amounts of data to be hashed very quickly while maintaining a reasonably low collision rate. The FNV-1 hash algorithm has been designed to allow implementations to output 32 to 1024 bit hashes.

The core of the **FNV-1** hash algorithm is as follows:

```plaintext
hash = OFFSET_PRIME
for each data_byte
    hash = hash * PRIME
    hash = hash ^ data_byte
return hash
```

A variation of the FNV-1 hash algorithm known as FNV-1a swaps the multiplication and exclusive-OR operations, which provides better distribution of hash codes over a specified bit-ness.

The core of the **FNV-1a** hash algorithm is as follows:

```plaintext
hash = OFFSET_PRIME
for each data_byte
    hash = hash ^ data_byte
    hash = hash * PRIME
return hash
```

`OFFSET_PRIME` and `PRIME` are predefined prime values that have been selected to give the best distribution and collision rate.

This algorithm can be implemented easily for use with the `GetHashCode` function, however FNV-1 and FNV-1a are designed to work on a byte-by-byte basis. Since we're working with 32-bit hash codes, it makes more sense to modify the algorithm slightly to allow us to hash 32 bits at a time.

```csharp
public readonly struct Point(int x, int y) : IEquatable<Point>
{
    public int X => x;
    public int Y => y;

    public override int GetHashCode()
    {
        unchecked
        {
            const int OffsetPrime = (int)2166136261;
            const int Prime = 16777619;

            int hash = OffsetPrime;

            int[] hashCodes = new int[]
            {
                X.GetHashCode(),
                Y.GetHashCode()
            };

            foreach(int hashCode in hashCodes)
            {
                hash ^= hashCode;
                hash *= Prime;
            }

            return hash;
        }
    }
}
```

Whilst the FNV-1a hash algorithm is simple to implement, it’s rather cumbersome to implement for every custom type. We can solve this by refactoring the hash algorithm to work with any custom type, and wrapping the implementation into an extension method; for example:

```csharp
public static class ObjectExtensions
{
    public static int GetHashCode(this object obj, params object[] members)
    {
        unchecked
        {
            const int Offset = (int)2166136261;
            const int Prime = 16777619;

            int hash = Offset;

            foreach (object member in members)
            {
                hash ^= member?.GetHashCode() ?? default;
                hash *= Prime;
            }

            return hash;
        }
    }
}
```

There is a caveat to this extension method that map cause performance issues. Since the method has a `params object[] members` parameter, any of these parameters that are value types will need to be boxed. Also, it's possible that some of the arguments passed into the method may be nullable, therefore you will need to establish a mechanism for handing null values. This example simply assumes default (zero) in place of null values.

### Hashing Single-Value Wrapper Types

Sometimes it makes sense to wrap a single value into a class, especially when the value meets one of the following criteria:

- Some specific business logic needs to be performed on the value.
- The value conforms to a defined set of constraints and rules.
- The encapsulating class gives the value greater semantic meaning.

An example of this could be described as:

```csharp
string x500Name = "O=Acme, L=London, C=GB";
```

This string represents an X500 name, however there are a few rules and constraints governing what constitutes a valid X500 name, therefore it makes sense to wrap X500 names into a class that encapsulates these rules and constraints, and as a bonus, it gives us a type with a very distinct semantic meaning.

```csharp
public sealed class X500Name : IEquatable<X500Name>
{
    private readonly string name;

    ...
}
```

*For the sake of brevity, the* `X500Name` *class does not contain any implementation details; only the name, since this is all we need in order to focus on the hashing perspective.*

Since the `X500Name` class only has a single field, there's only one thing to hash; the `name` field. In such cases, we can just return the hash code of the field.

```csharp
public sealed class X500Name
{
    private readonly string name;

    public override int GetHashCode() => name?.GetHashCode() ?? default;
}
```

While this approach is quite effective for single-value wrapper types, if the value is nullable, then you will need to establish a mechanism for handing null values. This example simply assumes default (zero) in place of null values.

Alternatively if you decide to take the approach using the FNV hash algorithm, you could just pass `name` as an argument to the extension method, and let the extension method take care of nulls for you.

```csharp
public sealed class X500Name
{
    private readonly string name;

    public override int GetHashCode() => this.GetHashCode(name);
}
```

### Using System.HashCode

Now that you know how to implement hash code algorithms in C#, you can probably forget it all! As of .NET Standard 2.1, the framework now includes a [HashCode](https://docs.microsoft.com/en-us/dotnet/api/system.hashcode?view=netstandard-2.1) struct, which you can use to implement `GetHashCode` on your custom types; for example:

```csharp
public readonly struct Point(int x, int y) : IEquatable<Point>
{
    public int X => x;
    public int Y => y;

    public bool Equals(Point other) =>
        X == other.X &&
        Y == other.Y;

    public override int GetHashCode() => HashCode.Combine(X, Y);
}
```

### Hashing Collections

There's one case `HashCode.Combine` won't handle for you. Arrays and most collections don't override `Equals` or `GetHashCode`, so they compare and hash by reference. Pass a `byte[]` to `HashCode.Combine` and you hash the array's identity, not its contents: two objects holding identical bytes get different hash codes, and a dictionary treats them as different keys.

[OnixLabs.Core](/Products/DotNet#onixlabs-core) hashes by content instead. `GetContentHashCode()` hashes the bytes of a `ReadOnlySpan<byte>` several at a time, without allocating, and `SequenceEqualOrNull` compares two sequences element by element, treating two `null` sequences as equal:

```csharp
using OnixLabs.Core;
using OnixLabs.Core.Linq;

public sealed class Signature(string algorithm, byte[] value) : IEquatable<Signature>
{
    public string Algorithm { get; } = algorithm;
    public byte[] Value { get; } = value;

    public bool Equals(Signature? other) =>
        other is not null &&
        Algorithm == other.Algorithm &&
        Value.SequenceEqualOrNull(other.Value);

    public override bool Equals(object? obj) => Equals(obj as Signature);

    public override int GetHashCode() => HashCode.Combine(Algorithm, new ReadOnlySpan<byte>(Value).GetContentHashCode());
}
```

For other collections, `OnixLabs.Core.Linq` provides the same `GetContentHashCode()` for any `IEnumerable<T>`. One caution applies to all of these, and to `System.HashCode` itself: the result is randomized for each process, so it's for lookups while your program runs, never for storing or sending anywhere.
