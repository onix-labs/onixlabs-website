---
title: "Billion-Dollar Mistakes and Functional Fixes"
description: "Why null references and unchecked exceptions cause so many bugs, and how Optional<T> and Result<T> make absence and failure explicit in C#."
category: dotnet
order: 4
path: /Documentation/DotNet/Billion-Dollar-Mistakes-And-Functional-Fixes
advert: dotnet
published: 2025-12-15
updated: 2026-11-24
---

## Introduction

You're following a map, and it shows a bridge across the river. You walk for an hour, come round the last bend, and there's no bridge. There never was. The mapmaker drew what they hoped would be there.

A missing bridge isn't a disaster. Plenty of rivers don't have one, and if the map had said so, you'd have gone another way. The disaster is the map. You planned your journey around something that it promised, and found out that it wasn't true at the worst possible place.

A method signature is a map. It's how a method tells its callers what they'll find when they get there.

```csharp
Landmark FindLandmark(string name);
```

This one draws a bridge. Give it a name, and you'll get a landmark. What it leaves off is what happens when there's no such landmark. You might get `null`. You might get an exception. The signature doesn't mention either, so every caller plans a journey on the assumption that the bridge is there.

This article is about those two missing parts of the map: values that aren't there, and failures that nobody mentioned. We'll see why they cause so much trouble, why the usual remedies only go so far, and how to draw them in, using `Optional<T>` and `Result<T>`.

It builds on [Understanding Monads](/Documentation/DotNet/Understanding-Monads), which explains how those two types work. Here, we're interested in why you'd want them. Code samples leave out documentation comments and argument validation for brevity.

## The Billion-Dollar Mistake

We know exactly where `null` came from, because the person responsible has owned up. This is how Tony Hoare [introduced a talk in 2009](https://qconlondon.com/london-2009/qconlondon.com/london-2009/presentation/Null%2BReferences_%2BThe%2BBillion%2BDollar%2BMistake.html):

> I call it my billion-dollar mistake. It was the invention of the null reference in 1965. At that time, I was designing the first comprehensive type system for references in an object oriented language (ALGOL W). My goal was to ensure that all use of references should be absolutely safe, with checking performed automatically by the compiler. But I couldn't resist the temptation to put in a null reference, simply because it was so easy to implement.

Look at what he was trying to do. The references were going to be safe, and the compiler was going to check them. Then he put in one value that belonged to every type and behaved like none of them. A `Landmark` variable could now hold a landmark, or something that wasn't a landmark at all, and the type was the same either way.

### Absence Isn't the Problem

There's nothing wrong with something being missing. Not every name is on the map, not every person has a middle name, and not every order has been delivered. Programs have to deal with absence all the time.

What's wrong with `null` is how it does it.

**It's invisible.** `Landmark FindLandmark(string name)` is the signature of a method that always finds a landmark. It's also the signature of one that usually doesn't.

**It's the same for everything.** Does `null` mean that there's no such landmark, that the atlas hasn't loaded yet, or that somebody forgot to set a field? It's one value with every meaning, so it carries none.

**It goes off somewhere else.** This is the expensive one.

```csharp
public sealed class Journey(Landmark destination)
{
    public Landmark Destination { get; } = destination;

    public string Describe() => $"Travelling to {this.Destination.Name}";
}
```

```csharp
Journey journey = new(atlas.FindLandmark("Atlantis"));    // Nothing happens

// Much later, in another part of the program
journey.Describe();                                       // NullReferenceException
```

The mistake is on the first line, and the exception is on the last. In between, the `null` might be passed through a dozen methods, stored in a database, and read back the following week. By the time it goes off, whoever planted it has long since left.

### Why Not Just Check?

It's easy to say that everybody should check for `null`. Everybody does, when they remember.

The trouble is that the map doesn't tell you where to look. If any reference might be `null`, you either check every one, and bury your program in checks that can never fail, or you check the ones you think need it, and trust your judgement forever. Neither is a plan. A rule that only works while everybody is paying attention is a rule that doesn't work.

## Nullable Reference Types

C# 8 made it possible to draw some of the missing part. With nullable reference types enabled, `Landmark` means that there's a landmark, and `Landmark?` means that there might not be.

```csharp
Landmark? FindLandmark(string name);

Landmark? landmark = atlas.FindLandmark("Atlantis");

Console.WriteLine(landmark.Name);    // Warning CS8602: possible null reference
```

It's a great improvement. The signature tells the truth, and the compiler follows the value through your code and warns you if you use it without checking. If you do nothing else after reading this, turn it on, and treat its warnings as errors.

It has limits, though, because it's advice rather than a rule. The question mark guides the compiler's analysis and then disappears. While the program is running, a `Landmark` and a `Landmark?` are exactly the same, and there are ways for a `null` to get in that the compiler doesn't see.

```csharp
string[] names = new string[3];

int length = names[0].Length;    // No warning, NullReferenceException
```

Arrays start out full of nulls, whatever their type says. So do objects that come from outside:

```csharp
public sealed record Landmark(string Name, Point Position);
```

```csharp
Landmark? landmark = JsonSerializer.Deserialize<Landmark>("{}");

if (landmark is not null)
    Console.WriteLine(landmark.Name.Length);    // No warning, NullReferenceException
```

We checked, the compiler was satisfied, and it failed anyway. `Name` is a `string`, not a `string?`, but by default the serialiser isn't aware of the difference. (You can make it aware, with `RespectNullableAnnotations` and `RespectRequiredConstructorParameters`. You should.)

### The Zero That Looks Like an Answer

Nullable reference types have nothing to say about the other kind of missing value, because it isn't `null` at all.

```csharp
List<Point> points = [new(123, 456), new(789, 12)];

Point found = points.FirstOrDefault(point => point.X > 1000);    // (0, 0)
```

No point matches, so `FirstOrDefault` returns the default `Point`, which is (0, 0). That's a perfectly good point. Nothing throws, nothing warns, and your program sets off for the top left-hand corner of the map.

A `null` at least goes off eventually. This never does.

## Drawing Absence on the Map

`Optional<T>`, from [OnixLabs.Core](/Products/DotNet#onixlabs-core), is a type that says a value might not be there. It's either `Some<T>`, with a value inside, or `None<T>`.

```csharp
using OnixLabs.Core;

public interface IAtlas
{
    Optional<Landmark> FindLandmark(string name);
}
```

It looks like a small change from `Landmark?`, but it's a different kind of promise. An `Optional<Landmark>` isn't a landmark that you've been advised to check. It isn't a landmark at all. There's no `Name` to read until you've said what to do without one.

```csharp
string description = atlas.FindLandmark("Atlantis").Match(
    some: landmark => $"Travelling to {landmark.Name}",
    none: () => "Nowhere to go");
```

The bridge might not be there, and now you can't set off without a plan for that.

It also settles the question of what to store. A `Journey` takes a `Landmark`, and an `Optional<Landmark>` won't fit, so the question has to be answered where it arises. Nothing gets planted to go off later.

### Finding Things

`OnixLabs.Core.Linq` has versions of LINQ's methods that don't invent an answer:

```csharp
using OnixLabs.Core.Linq;

Optional<Point> found = points.FirstOrNone(point => point.X > 1000);    // None
```

It works for points, for landmarks, and for anything else, because it doesn't need a special value to stand for nothing.

### Living With Null

You don't have to change everything at once. Plenty of code returns `null`, and always will, so convert it where it comes in. From there on, your own code doesn't have to think about it.

```csharp
Optional<Landmark> landmark = landmarks.GetValueOrDefault("Atlantis");
```

Here, `landmarks` is a dictionary, and the conversion is implicit: `null` becomes `None`, and anything else becomes `Some`. There's a `ToOptional()` method for when you'd rather say so. That one treats default values such as zero as missing too, which suits some sources and not others. [Understanding Monads](/Documentation/DotNet/Understanding-Monads#some-or-of) explains how to choose.

## The Other Missing Part

Absence is only half of what the map leaves off. Here's a method that loads a route from a file.

```csharp
public static Route Load(string path) => JsonSerializer.Deserialize<Route>(File.ReadAllText(path))!;
```

According to the signature, there's one way out of this method: with a route. Let's see how many there really are.

| What's wrong | What happens |
|---|---|
| The file doesn't exist | `FileNotFoundException` |
| The folder doesn't exist | `DirectoryNotFoundException` |
| The path is a folder | `UnauthorizedAccessException` |
| The path is empty | `ArgumentException` |
| The file isn't valid JSON | `JsonException` |
| The file contains `null` | Returns `null` |

That's one line of code, and seven ways out. The signature mentions one of them.

An exception is a second way of returning from a method, and it isn't in the type. You can only find out about it from the documentation, from the source code, or in production. It has the same fault as `null`, which is that the signature says one thing and the method does another.

### Catching Isn't Handling

Since you can't tell what might be thrown, the natural response is to catch everything.

```csharp
public static Route? TryLoad(string path)
{
    try
    {
        return Load(path);
    }
    catch (Exception)
    {
        return null;
    }
}
```

This looks responsible, and it's the worst of both worlds. Each of those failures could have told somebody what to do, and it has turned them all into the one value that means nothing. Whether the file is missing, locked or damaged, the answer is `null`.

It catches too much as well. If there's a bug in `Load`, that becomes `null` too, and we'll never hear about it.

### Failures Aren't All Alike

The word "exception" covers three quite different things, and it helps to separate them.

| Kind | For example | What to do |
|---|---|---|
| **Expected** | The file isn't there | Tell the caller |
| **A bug** | An index is out of range | Throw, and fix it |
| **A disaster** | There's no memory left | Let it throw |

Files are missing every day. A program that loads them has to expect it, so there's nothing exceptional about it, and the caller is the one who knows what to do. That's an outcome, and it belongs in the signature.

A bug is different. No caller can do anything sensible about an index out of range, and pretending otherwise only hides it. Exceptions are very good at bugs. They stop the program doing any more damage, and they tell you where it happened.

So the question isn't whether exceptions are good or bad. It's whether the caller could reasonably be expected to deal with this. If so, put it on the map.

### What About Checked Exceptions?

Java tried to do just that. A method has to declare the checked exceptions it can throw, and its callers have to catch them or declare them in turn.

The idea was right. The exceptions were on the map. But they were drawn beside the type rather than in it, and that made them hard to work with. A list of exceptions isn't a value. You can't store it, return it, or pass it to another method, and it fits badly with lambdas, whose standard interfaces don't declare any. Many Java programmers ended up wrapping everything in an unchecked exception, and the map went blank again.

What's needed is a failure that's an ordinary value.

## Drawing Failure on the Map

`Result<T>` is the answer to exceptions that `Optional<T>` is to `null`. It's either a `Success<T>`, with a value inside, or a `Failure<T>`, with the exception that explains why not.

```csharp
public static Result<Route> Load(string path) => Result<string>
    .Of(() => File.ReadAllText(path))
    .Select(text => JsonSerializer.Deserialize<Route>(text) ?? throw new JsonException("The file is empty."));
```

There are two ways out of this method, and the signature shows both. `Of` runs code that might throw, and catches what it throws. `Select` carries on only if there's something to carry on with. The `null` that used to slip through is now a failure like any other.

Nothing has been lost, either. The exception is still there, so a caller that cares can be as particular as it likes:

```csharp
string message = Load("treasure.json").Match(
    success: route => $"Loaded {route.Name}",
    failure: exception => exception switch
    {
        FileNotFoundException => "There's no such route.",
        JsonException => "The route is damaged.",
        _ => "The route couldn't be loaded."
    });
```

### Failures of Your Own

Not every failure starts as an exception that somebody threw. When your own rules say no, return the failure, and the conversion is implicit:

```csharp
public static Result<Route> Plan(Landmark start, Landmark end) => start == end
    ? new InvalidOperationException("You're already there.")
    : new Route($"{start.Name} to {end.Name}", [start.Position, end.Position]);
```

There's a pleasant side effect. Throwing is slow, because the runtime has to record the stack and go looking for someone to catch it. In a rough measurement on .NET 11, throwing and catching an exception took about 1.5 microseconds, and returning one in a `Result<T>` took about 20 nanoseconds. That hardly matters for a failure that happens once a day. It matters a good deal for one in every row of a file you're importing.

### Nothing to Return

Some methods have no value to return, but can still fail. For those, there's `Result` without a type:

```csharp
Result Save(Route route);
```

### Both at Once

Sometimes a method can come back with nothing, *and* can fail. Looking for the only point in some part of the map is a good example. There might be one, there might be none, or there might be several, in which case the question didn't make sense.

LINQ's `SingleOrDefault` deals with those by returning the point, returning a fake point, and throwing. `SingleOrNone` draws all three:

```csharp
Result<Optional<Point>> only = points.SingleOrNone(point => point.X > 500);

string message = only.Match(
    success: optional => optional.Match(
        some: point => $"Found ({point.X}, {point.Y})",
        none: () => "There's nothing there."),
    failure: _ => "There's more than one.");
```

It's a lot to unpack, but it's all true. Whoever wrote the signature had three outcomes, and whoever calls it has to think about three.

## Pitfalls

### The Result Nobody Looked At

This is the one to worry about. What happens here?

```csharp
atlas.Save(route);
```

If `Save` throws when the disk is full, you'll hear about it. If it returns a `Result`, and nobody looks, the failure is dropped without a sound. An exception that isn't caught stops the program. A result that isn't checked does nothing at all.

So a result makes a failure visible, but it can't make you look. Ask the compiler to help. The rule IDE0058 warns when a value is ignored, including one from an awaited task, and it can be turned on for a whole solution in `.editorconfig`:

```ini
[*.cs]
dotnet_diagnostic.IDE0058.severity = warning
```

Set `EnforceCodeStyleInBuild` to `true` in the project as well, so that it applies to every build. It covers every ignored value, not only results, so code that chains calls for their effects will need a discard, `_ =`, to say that it's deliberate.

If you really do want to stop when something fails, say so. `Throw` does nothing for a success, and throws the original exception for a failure:

```csharp
atlas.Save(route).Throw();
```

### Catching Too Much

`Result<T>.Of` catches everything, so it catches bugs. Wrap a whole method in it, and a typing mistake on the tenth line will be reported as though the file was missing. That's `TryLoad` all over again.

Keep it at the edges, and keep it small. Wrap the one call that's expected to fail, such as reading the file, and let everything else throw as it always did.

Watch out for cancellation too. A cancelled task throws, so `OfAsync` turns it into a failure along with everything else. If cancelling should stop the whole operation rather than count as one of its outcomes, check for `OperationCanceledException` before you treat the failure as ordinary.

### Getting Out Early

`GetValueOrThrow` turns an honest signature back into a dishonest one. It's right when an empty box really would be a bug, and in a test. Anywhere else, it's `null` with extra steps.

## Which Should I Use?

| What can happen | Return |
|---|---|
| There's always a value | `T` |
| There might not be one | `Optional<T>` |
| It might fail | `Result<T>` |
| It might fail, with no value | `Result` |
| It might fail, or find nothing | `Result<Optional<T>>` |
| Only a bug could stop it | `T`, and throw |

If you're torn between `Optional<T>` and `Result<T>`, ask whether the caller needs to know why. "It isn't on the map" needs no explanation. "I couldn't read the map" does.

## Objections

> Isn't this just checking for null with more typing?

The check is the same. What's different is who remembers to do it. With `null`, that's you, every time. With `Optional<T>`, it's the compiler.

> I've got nullable reference types. Isn't that enough?

For a private method, or a short chain of `?.`, it often is. Use them everywhere, with or without `Optional<T>`. Reach for the type when absence is part of what a method means, when the value is a struct, when it's crossing a boundary that the compiler can't see over, or when several steps follow on from each other.

> Everyone who reads my code will have to learn this.

They will, and it takes an afternoon. They're already learning which of your methods return `null` and which ones throw, and that takes as long as they work there.

> Should I never throw an exception again?

Throw as much as you like, for bugs. An argument that should never be negative, or a state that should be impossible, is exactly what exceptions are for. It's the failures you expect that shouldn't be a surprise.

## Where to Start

You can't redraw the whole map at once, and you don't need to.

1. **Turn on nullable reference types,** and treat the warnings as errors.
2. **Start at the edges,** with the methods that read files, call services and query databases. They're where values go missing and things fail.
3. **Convert as things come in.** Turn `null` into `Optional<T>`, and exceptions you expect into `Result<T>`, as close to the source as you can.
4. **Let the types spread inwards.** A method that calls one returning `Result<T>` will usually want to return one itself.
5. **Open the box at the other edge,** where you show a message, write a response, or choose an exit code. That's the one place that knows what to do in every case.

In between, your code can trust what its types say. A `Landmark` is a landmark, and a `Route` is a route.

## Putting It Together

Here's how it began:

```csharp
Landmark FindLandmark(string name);

Route Load(string path);

void Save(Route route);
```

And here's the same map, with the rest drawn in:

```csharp
using OnixLabs.Core;

Optional<Landmark> FindLandmark(string name);

Result<Route> Load(string path);

Result Save(Route route);
```

Nothing about what these methods do has changed. A landmark could always be missing, and a file could always fail to load. All we've done is stop pretending otherwise.

Hoare finished his introduction by mentioning languages in which a reference has to say whether it can be `null`, and added one more sentence:

> This is the solution, which I rejected in 1965.

There's still time to accept it.

See [Optional&lt;T&gt;](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.Optional), [Result&lt;T&gt;](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.Result-T) and [IEnumerableExtensions](https://github.com/onix-labs/onixlabs-dotnet/wiki/OnixLabs.Core.Linq.IEnumerableExtensions) in the API reference.
