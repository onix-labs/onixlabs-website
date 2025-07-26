# Syntactic Sugar, Bitter Aftertaste

This article takes a deep dive into the `var` keyword in C#, examining its intended use cases, the common pitfalls that can arise from overusing it, and the reasons why I personally favor explicit types that speak for themselves, especially when clarity, readability, and maintainability are priorities in a codebase.

## A Shortcut Too Far

Implicit typing via the `var` keyword has been a part of C# since version 3.0, offering developers a way to reduce verbosity in local variable declarations. However, like many *convenience* features in modern programming, it’s often misunderstood and frequently misused. The result? A widespread decline in code clarity and consistency.

Let me be clear: I don’t hate `var`. I simply believe it has far fewer valid use cases than most developers are willing to admit. Despite Microsoft's endorsement of `var` in certain contexts, their own guidance outlines clear boundaries; boundaries routinely ignored in the name of habit, tooling defaults, or perceived productivity.

## Justifications & Rebuttals

> I use `var` everywhere.

Even Microsoft's own guidance is clear: use `var` only when the type is **unmistakably obvious**. But here’s the uncomfortable truth: using `var` *only* in such contexts requires **discipline**, and when it really matters, many developers don’t exercise it.

Worse still, the notion of what’s *obvious* is itself often subjective:

```csharp
var input = Console.ReadLine();
```

Was that obvious? Perhaps. Many of us have used it countless times. But function names are not type declarations, and `ReadLine()` gives you no semantic hint that it returns a `string`. 

**Familiarity** with the framework **doesn’t excuse ambiguity**.

```
var number = Convert.ToInt32(...);
```

That *sounds* clear enough, but even here, Microsoft cautions:

**Do not assume the type is clear from a method name.**

In fact, the guidance goes further, offering a specific definition of what qualifies as _clear_:

**A variable type is considered clear if it's a** `new` **operator, an explicit cast, or assignment to a literal value.**

So here’s the real question: can you honestly say you follow that rule consistently? If not, if you've ever relied on your *gut* rather than that exact definition, then you've already **broken the first principle of using** `var`**.**

> It's the default setting in Resharper, so I just follow what Resharper suggests.

Resharper is a tool, not a mentor, not a style guide, and certainly not a substitute for developer judgment. At best, it enforces a set of **opinionated** heuristics. At worst, it encourages mechanical refactoring without any consideration for readability or intent. Blind adherence to tooling is not a standard; **it's abdication of craftsmanship**.

> I can easily discover a variable's type. I just hover over its name.

Can you really? Try this:

```csharp
var message = MessagingService.GetMostRecentMessage();
```

Now, tell me what `message` is, without help from your IDE. In the vacuum of a code review, a GitHub diff, or a shared screenshot, **IntelliSense doesn’t come to the rescue**. This is precisely where explicit types shine: **they communicate meaning immediately, and with certainty.**

> Explicit types are just verbose. I can code faster with `var`.

Speed of writing code is not the same as speed of understanding code. Typing `string` instead of `var` might cost you a second; figuring out what `var` represents in a deeply nested call chain can cost minutes. Code is read far more than it is written. **Optimize for the reader.**

Besides, if your metric for productivity is keystrokes per minute, then learn to type faster!

> The variable name should tell you what its type is.

Absolutely it should not! It is **not** the responsibility of a variable’s name to communicate its type, just as we abandoned Hungarian Notation for the same flawed reasoning. A variable’s name should convey **semantic meaning**; a description of its role within the problem domain, not its technical implementation.

When paired with an explicit type declaration, you achieve both clarity and expressiveness: the type tells you what it is, and the name tells you what it represents.

**Anything more is noise; anything less is ambiguity**.

> Long type names like `IReadOnlyDictionary<Guid, IList<Membership>>` are distracting.

On the contrary, these are precisely the kinds of types that **should** be written out explicitly. When a type is complex, generic, or deeply nested, using `var` only serves to obscure what’s really going on. Omitting the type in these cases doesn’t reduce cognitive load, it increases it, forcing the reader to infer meaning that should have been stated plainly.

Explicit types, especially for intricate structures, provide immediate clarity. **Masking them with** `var` **doesn’t make the code cleaner, it makes it cryptic.**

## Official Guidance

Microsoft does, in fact, provide thoughtful guidance on this matter. In the official [C# Coding Conventions](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/inside-a-program/coding-conventions), they state:

Use [implicit typing](https://learn.microsoft.com/en-us/dotnet/csharp/programming-guide/classes-and-structs/implicitly-typed-local-variables) for local variables when the type of the variable is obvious from the right side of the assignment.

```c#
var message = "This is clearly a string.";
var currentTemperature = 27;
```

Don't use [var](https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/statements/declarations#implicitly-typed-local-variables) when the type isn't apparent from the right side of the assignment. Don't assume the type is clear from a method name. A variable type is considered clear if it's a `new` operator, an explicit cast, or assignment to a literal value.

```c#
int numberOfIterations = Convert.ToInt32(Console.ReadLine());
int currentMaximum = ExampleClass.ResultSoFar();
```

Don't use variable names to specify the type of the variable. It might not be correct. Instead, use the type to specify the type, and use the variable name to indicate the semantic information of the variable. The following example should use `string` for the type and something like `iterations` to indicate the meaning of the information read from the console.

```c#
var inputInt = Console.ReadLine();
Console.WriteLine(inputInt);
```

---

Let’s also not forget that `var` is not a universal substitute for type declarations. There are many cases where `var` is invalid, and therefore, in addition to the guidance (above), explicit type declarations are necessary.

**Null Assignments:**

```c#
var message = null;            // Invalid
string? message = null;        // Valid
```

**Class Members:**

```c#
public sealed class MessageService
{
    private readonly var prefix = "Hello";        // Invalid
    private readonly string prefix = "Hello";     // Valid
}
```

## Declaration Mismatch—A Mental Minefield

Even if you apply `var` with unwavering discipline, the end result is often a patchwork of implicit and explicit declarations scattered throughout your codebase. The irony is striking: in the effort to reduce visual clutter and eliminate verbosity, you may have inadvertently introduced inconsistency and obscurity instead.

In trying to simplify the surface, you've made the underlying meaning harder to discern. Consistency, after all, is a key pillar of readability, and `var`, when used indiscriminately, erodes that foundation.

## Where var Actually Makes Sense

In my humble opinion, `var` should be used sparingly. As you've probably gathered by now, I explicitly declare every variable in my codebase. So, how does `var` fit in? The answer is **anonymous types**. These are the only type that I declare with `var`, because they can **only** be declared with `var`. In that context, even `var` becomes a clear signal; an **explicit** type declaration, if you will, that “this type is anonymous by design.”

## Conclusion

Yes, I know my stance is a minority one. That’s fine. I don’t measure good code by popularity contests. I measure it by clarity, maintainability, and how easily it can be understood six months from now (often by me).

To me, `var` is a tool that should be used intentionally and sparingly. Most of the time, it hides more than it reveals. And in a statically typed language like C#, explicitness is a virtue, not a burden.

I'll leave you with a thought from a junior developer who once asked:

> Why would you use the `var` keyword instead of just declaring the explicit type? Surely it's more obvious what your code is doing if you can clearly see which types are being used? — Andrew Chambers

Exactly.

