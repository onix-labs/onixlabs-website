---
title: "Equality and Value Semantics"
navigationTitle: "Equality and Value Semantics"
description: "How .NET tests equality, and how to give your own types value semantics with IEquatable<T>, Equals, the == and != operators, and GetHashCode."
category: dotnet
order: 1
path: /Documentation/DotNet/Equality-And-Value-Semantics
published: 2025-12-15
---

## Introduction

The understanding and implementation of equality testing and value semantics (the comparison of objects by value, rather than by reference) is something that is commonly overlooked when designing .NET types.

In this article we’re going to understand the importance of implementing equality and value semantics, and how this can improve the overall design of a system.

### Common Language Specification

The Common Language Specification features five different type categories; classes, structures, interfaces, enumerations and delegates.

Each of these type categories perform type checking differently. When defining your own types, those types inherit the functionality defined by the `Equals` method of its base type. The following information describes the default implementation in .NET of the `Equals` method for each of the type categories:

#### Class

Equality is performed by calling `object.Equals(object obj)` and determines whether objects are equal by reference; equivalent to calling `object.ReferenceEquals(object objA, object objB)`.

#### Structure

Equality is performed by calling `ValueType.Equals(object obj)` and determines whether objects are equal by value by performing either byte-by-byte comparison or field-by-field comparison using reflection.

#### Enumeration

Equality is performed by calling `Enum.Equals(object obj)` and determines whether the values have the same enumeration type and the same underlying value.

#### Delegate

Equality is performed by calling `MulticastDelegate.Equals(object obj)` and determines whether the delegates have the same type, with identical invocation lists.

#### Interface

Equality is performed by calling `object.Equals(object obj)` and determines whether objects are equal by reference.

### Equality Testing Mechanisms in .NET

C# and .NET provide several language-level and framework-level features for performing equality testing between type instances.

#### Methods

It’s quite clear that Microsoft understood the importance of equality testing as the three fundamental method implementations for these tests are implemented at the root of the type hierarchy.

##### ReferenceEquals (static)

Determines whether the specified object instances are the same instance. This method will return true if `objA` and `objB` are the same instance, or if both are null; otherwise, false.

```csharp
object.ReferenceEquals(object objA, object objB)
```

As of C# 7.0 static code analysis will identify `ReferenceEquals` checks for null and suggest replacing these will pattern matching expressions; for example:

```csharp
if (obj is null)
```

##### Equals (static)

Determines whether the specified object instances are considered equal. This method will return true if the objects are considered equal; otherwise false. If both `objA` and `objB` are null, the method returns true.

```csharp
object.Equals(object objA, object objB)
```

##### Equals (instance)

Determines whether the specified object is equal to the current object. This method will return true if the specified object is equal to the current object; otherwise false.

```csharp
Equals(object obj)
```

#### Operators

The equality testing operators `==` and `!=` are implemented by default for reference types and compare object instances by reference, however there is no default implementation of these operators for value types.

#### Interfaces

The .NET Standard API exposes an interface called `IEquatable<T>` which provides a type-specific method for determining equality of type instances.

### Implementation Guide

The aim of this implementation guide is to establish a set of rules and best practices for implementing equality checking when designing C# types — specifically we’re going to focus on classes and structures to understand the importance of implementing equality and value semantics.

When implementing value types, you should always override `Equals` because tests for equality that rely on reflection offer poor performance.

You can also override the default implementation of `Equals` for reference types to test for value equality, thus defining the precise value semantics for the type.

*The decision of whether to implement a class or a structure is subject to a different topic of design, however Microsoft have outlined the considerations that should be made for those design decisions* [*here*](https://docs.microsoft.com/en-us/dotnet/standard/design-guidelines/choosing-between-class-and-struct)*.*

#### Example

There are many cases in .NET applications where classes are designed to be value oriented as opposed to behaviour oriented.

*For the sake of brevity and clarity in this example, some code samples have been deliberately shortened, however a full version of the example class will also be demonstrated.*

Let’s start by taking a look at a typical example of such a class:

```csharp
public sealed class Product(string name, decimal price)
{    
    public string Name => name;
    public decimal Price => price;
}
```

Let’s go ahead and create some instances of this class:

```csharp
Product milk1 = new Product("Milk", 1.99m);
Product milk2 = new Product("Milk", 1.99m);
object  milk3 = new Product("Milk", 1.99m);
Product milk4 = milk1;
Product milk5 = null;
```

What can we identify about these instances?

- `milk1` and `milk2` are *seemingly* identical.
- `milk1` and `milk2` are *seemingly* identical to `milk3` except that is it declared as an `object`.
- `milk4` and `milk1` are identical by reference.
- `milk5` is null.

But what happens when we try to equate these instances?

```csharp
milk1.Equals(milk2)   // False
milk1 == milk2        // False

milk1.Equals(milk3)   // False
milk1 == milk3        // False
milk1.Equals(milk4)   // True
milk1 == milk4        // True
milk1.Equals(milk5)   // False
milk1 == milk5        // False
```

This correlates with the default implementation for `Equals` on class types as described in the Common Language Specification section above, but it's probably not the behaviour we want for a value oriented class, rather it seems more suitable to implement value semantics so that we can equate classes by value, as well as by reference.

##### Step 1: Implementing IEquatable<T>

It might seem like overriding `Equals` on the `Product` class would be a good place to start, but actually a better place to start would be to implement `IEquatable<Product>` since this gives us a typed equality testing mechanism, and we can forward more generalized, object-based equality calls into this method.

```csharp
public sealed class Product(string name, decimal price) : IEquatable<Product>
{    
    public string Name => name;
    public decimal Price => price;

    public bool Equals(Product other) =>
        ReferenceEquals(other, this)
        || other is Product
        && Name == other.Name
        && Price == other.Price;
}
```

The `Equals` method implementation checks whether `other` is equal to this by reference OR `other` is an instance of `Product` AND then compares the values of each property.

So what happens when we try to equate these instances now?

```csharp
milk1.Equals(milk2)   // True
milk1 == milk2        // False

milk1.Equals(milk3)   // False
milk1 == milk3        // False
milk1.Equals(milk4)   // True
milk1 == milk4        // True
milk1.Equals(milk5)   // False
milk1 == milk5        // False
```

You’ll notice if you correlate these results with the results above, that only one result has changed, and that was `milk1.Equals(milk2)`. This is because the typed `Equals` implementation provided by `IEquatable<T>` was used to perform equality checking here.

##### Step 2: Overriding Equals

This still isn’t quite the behaviour we want because we’re unable to equate `object` declarations; in this case `milk3` is still not equal to `milk1` despite being instantiated with exactly the same information. This is where we override the `Equals` method on the `Product` class to provide a generalised equality checking implementation.

```csharp
public sealed class Product(string name, decimal price) : IEquatable<Product>
{    
    public string Name => name;
    public decimal Price => price;

    public bool Equals(Product other) =>
        ReferenceEquals(other, this)
        || other is Product
        && Name == other.Name
        && Price == other.Price;

    public override bool Equals(object obj) => obj is Product other && Equals(other);
}
```

The overridden `Equals` method implementation just passes the equality check to the `IEquatable<T>` implementation by type-casting `obj` as a `Product`.

So what happens when we try to equate these instances now?

```csharp
milk1.Equals(milk2)   // True
milk1 == milk2        // False

milk1.Equals(milk3)   // True
milk1 == milk3        // False

milk1.Equals(milk4)   // True
milk1 == milk4        // True

milk1.Equals(milk5)   // False
milk1 == milk5        // False
```

Now we can see that `milk1` is equal to `milk3` even though `milk3` is declared as an `object` but this still isn't quite what we want.

##### Step 3: Implement Operators

Ideally the equality operators `==` and `!=` would also perform value equality checking. There's no need for them to perform reference checks, since this is now being handled directly from the `Equals` method implementations.

```csharp
public sealed class Product(string name, decimal price) : IEquatable<Product>
{    
    public string Name => name;
    public decimal Price => price;

    public bool Equals(Product other) =>
        ReferenceEquals(other, this)
        || other is Product
        && Name == other.Name
        && Price == other.Price;

    public override bool Equals(object obj) => obj is Product other && Equals(other);

    public static bool operator ==(Product a, Product b) => Equals(a, b);

    public static bool operator !=(Product a, Product b) => !Equals(a, b);
}
```

The overridden equality operator implementations calls `object.Equals` passing in `a` and `b` as arguments:

- If `a` and `b` are `null`, the method returns `true`.
- If `a` or `b` is `null`, the method returns `false`.
- If neither `a` or `b` are `null`, `a.Equals(b)` is called, forwarding equality testing into the custom `Equals` implementation of the type.

*For the* `!=` *or inequality operator, the result of* `object.Equals` *is simply negated.*

So what happens when we try to equate these instances now?

```csharp
milk1.Equals(milk2)   // True
milk1 == milk2        // True

milk1.Equals(milk3)   // True
milk1 == milk3        // False
milk1 == (Product)milk3 // True

milk1.Equals(milk4)   // True
milk1 == milk4        // True

milk1.Equals(milk5)   // False
milk1 == milk5        // False
```

Better still, but `milk1` and `milk3` will be compared by reference because `milk3` is declared as an `object`. As illustrated in the results, the only realistic way to circumvent this is to cast `milk3` to `Product`.

There is still a problem here however. Imagine you have a requirement in your software to store these products in a `HashSet<Product>`. Given that `milk1`, `milk2`, `milk3` are identical by value, `milk4` is identical by reference and `milk5` is null, how many items would you expect to see in the hash set?

Two, right? … wrong!

The `HashSet<T>` class relies on `GetHashCode` first to store a unique value. If a collision is found, it uses `Equals` to determine whether the type instances are in fact equal. Since we haven't yet overridden `GetHashCode` our custom type won't work properly with hashed collection types.

##### Step 4: Overriding GetHashCode

The `GetHashCode` method is quite closely related to the `Equals` method in some respects, though they have different roles and responsibilities in type design. The purpose of the `GetHashCode` method is to return a hash code that is deterministic and *unique* to the type instance. With regards to uniqueness, since `GetHashCode` returns 32-bit values, it is not considered globally or universally unique and may be subject to collisions.

Understanding hash code implementations is quite a broad topic. For the sake of completeness, there is another article on this topic, [here](/Documentation/DotNet/HashCode-Algorithms-And-Why-They-Matter).

The final implementation uses an implementation detailed in the link above, where the custom types properties are simply rolled into a new anonymous type, upon which `GetHashCode` is called.

```csharp
public override int GetHashCode() => HashCode.Combine(Name, Price);
```

### Final Implementation

Here is the product class fully implemented so you can see how everything hangs together.

```csharp
public sealed class Product(string name, decimal price) : IEquatable<Product>
{    
    public string Name => name;
    public decimal Price => price;

    public override int GetHashCode() => HashCode.Combine(Name, Price);

    public bool Equals(Product other) =>
        ReferenceEquals(other, this)
        || other is Product
        && Name == other.Name
        && Price == other.Price;

    public override bool Equals(object obj) => obj is Product other && Equals(other);

    public static bool operator ==(Product a, Product b) => Equals(a, b);

    public static bool operator !=(Product a, Product b) => !Equals(a, b);
}
```

### Differences for Structures

Implementing `Equals` and `GetHashCode` are virtually identical when working with structures as opposed to classes, in fact, there are only subtle changes that need to be corrected.

Since structures can’t be `null` by design, there is no need for the null check when implementing `IEquatable<Product>`. Since value types are copied by value, there is also no need to check referential equality.

```csharp
public readonly struct Product : IEquatable<Product>
{    
    public bool Equals(Product other) => 
        Name == other.Name &&
        Price == other.Price;
}
```

### Using Records

As of C# 9.0, record types have been introduced to C#, which provides value semantics out of the box. You can find out more about record types on the [Microsoft Docs](https://docs.microsoft.com/en-us/dotnet/csharp/whats-new/tutorials/records) site.

### Value Semantics in OnixLabs.Core

Step 3 is the easiest one to forget. `IEquatable<T>` only asks for an `Equals` method, so nothing stops a type from implementing it while `==` quietly carries on comparing references, and the two disagree.

[OnixLabs.Core](/Products/DotNet#onixlabs-core) closes that gap with `IValueEquatable<T>`. It extends `IEquatable<T>` and declares `==` and `!=` as static abstract members, so a type can't claim value semantics without providing the operators to match. Leaving them out is a compile error rather than a bug waiting to be found.

```csharp
using OnixLabs.Core;

public sealed class Product(string name, decimal price) : IValueEquatable<Product>
{
    public string Name { get; } = name;
    public decimal Price { get; } = price;

    public bool Equals(Product? other) => other is not null && Name == other.Name && Price == other.Price;

    public override bool Equals(object? obj) => Equals(obj as Product);

    public override int GetHashCode() => HashCode.Combine(Name, Price);

    public static bool operator ==(Product? left, Product? right) => Equals(left, right);

    public static bool operator !=(Product? left, Product? right) => !Equals(left, right);
}
```

Because the operators are part of the interface, generic code can rely on them too: anything constrained to `IValueEquatable<T>` can be compared with `==` and get value equality. A type that also needs ordering can implement `IValueComparable<T>`, which adds `<`, `<=`, `>` and `>=` in the same way. Across the ONIXLabs .NET libraries, types such as `Optional<T>`, `Result<T>` and the cryptographic primitives implement `IValueEquatable<T>`, so they all compare the same way.

See [IValueEquatable&lt;T&gt;](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.IValueEquatable) and [IValueComparable&lt;T&gt;](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.IValueComparable) in the API reference.
