# Underscore, Overkill

This article takes a deep dive into the use of underscores to denote member scope in code, exploring the historical context behind the convention, the common arguments made in its favor, the potential downsides it introduces in terms of readability and consistency, and the reasons why I personally believe that relying on more explicit naming conventions, rather than visual markers like underscores, leads to cleaner, more maintainable, and more modern codebases.

## A Problem Disguised as Convention

In the realm of C# development, few debates spark as much persistent contention as naming conventions for private member variables. Chief among them: the widespread practice of prefixing such members with an underscore (`_`). While this convention might seem innocuous, harmless even, it represents a relic of an earlier era that undermines code clarity, maintainability, and **modern** development principles.

Across various organisations and teams, it's not uncommon to see private fields named `_logger`, `_service`, or `_value`. This naming habit, oddly entrenched in the C# community, is often passed off as standard or even “best” practice. But if we step back and evaluate this pattern critically, it quickly becomes apparent that it’s a poor fit for modern C# development.

Unlike C#’s closest cousins, Java, Kotlin, TypeScript, even JavaScript to some extend, C# is the only mainstream language where this prefixing convention is still clung to so fervently. In a *recent* developer poll, a full **57%** of respondents favoured the underscore-prefix style, compared to **38%** who preferred plain camelCase without adornments. This divide reveals not just a difference in style, but a broader misunderstanding of what clean, self-expressive code should look like in the modern world.

Having worked professionally with all of the languages listed above, I can confirm that I have never seen this practice applied so *religiously* anywhere other than in C#.

For completeness, the results of the poll stand as follows:

| **Option**                   | **Result** |
| ---------------------------- | ---------- |
| **camelCase with _ prefix**  | 57%        |
| **camelCase with no prefix** | 38%        |
| **camelCase with m_ prefix** | 3%         |
| **Something else**           | 2%         |

Based on the poll, 57% of the demographic deem this style of code to be perfectly acceptable:

```c#
class Service
{
    private readonly ILogger<Service> _logger;

    public Service(ILogger<Service> logger)
    {
        _logger = logger;
    }
}
```

Let’s break down why this convention is so problematic.

## A Legacy from Simpler Times

The underscore prefix has its roots in the C and C++ worlds of the 1970s and 1980s; decades when developers lacked modern tooling, intelligent IDEs, and sophisticated code analysis. Back then, prepending a variable with `_` or `m_` (for "member") helped developers distinguish between local and member scope, particularly in sprawling 10,000-line source files.

But our tools, languages, and disciplines have evolved. Today, Visual Studio, Rider, and other modern IDEs provide immediate insight into variable scope, type, and access level. Static analysis, syntax highlighting, and code navigation features make such manual signals **obsolete**. The underscore prefix no longer serves a functional purpose. **It simply adds visual clutter**.

## A Solution From Day One

**C# provides a native, semantic mechanism for identifying member scope: the** `this` **keyword.**

When you write `this.value`, there is no ambiguity. It is **clearly** a reference to an instance member. This is a precise, readable, and compiler-supported way to resolve naming collisions when constructor parameters or local variables overlap with field names.

Contrast that with `_value`: **a naming crutch that** **obscures intent**. You lose the semantic clarity that `this` provides, and you introduce a naming pattern that carries no enforced meaning. Worse still, nothing stops another developer from introducing a local variable named `_value`, making the "collision avoidance" justification for the underscore invalid.

## Justifications & Rebuttals

> It reduces `this.` noise everywhere.

You don’t have to use `this.` everywhere when referring to a member variable. You are only required to do so when you have a local variable in scope with the same name. In contrast, if you prefix your member variable with an underscore, you're **forced** to use that everywhere because it's tacked onto the name, rather than leaning on the language; by definition adding unnecessary *noise*.

Before we proceed, ask yourself this: How often do your member and local scope variables collide?

*I’d hedge my bets that it’s rare.*

> It helps prevent name collisions.

**False.** Prefixing does not prevent collisions; it only shifts the burden. The compiler still allows `_value` to be shadowed by another `_value` in local scope. Meanwhile, `this.value` cannot be misinterpreted. It **always** refers to the member.

> Microsoft does it.

Some legacy .NET codebases do use underscores, but this is not an endorsement. Many of these conventions are inherited from C/C++ developers who joined the .NET project early on. If you examine more recent frameworks, you’ll see a shift *away* from underscores in member names.

The [official .NET naming guidelines](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/general-naming-conventions) [explicitly advise:](https://learn.microsoft.com/en-us/dotnet/standard/design-guidelines/general-naming-conventions)

**“DO NOT use underscores, hyphens, or any other non-alphanumeric characters”.**

> It improves readability.

Arguably, only superficially, and arguably because many would suggest it introduces “underscore slur”.

At first glance, a `_` might suggest a member, but so does `this.`, and the latter is **backed by language semantics**. The underscore has **no universal meaning**. In some teams, `_` denotes private, in others protected, or even thread-safety conventions. The result is **ambiguity, not clarity**.

> Resharper recommends it.

Resharper also allows customising nearly every rule. Following a tool’s default blindly is not an act of professionalism, **it’s an abdication of judgment**. Tools should conform to thoughtful code standards, not the other way around.

> In a long function or method, I can immediately tell whether something is a member without scrolling.

“The first rule of functions is that they should be short. The second rule of functions is that they should be shorter than that.”—Robert C. Martin (Uncle Bob).

If you’re using underscores as a visual cue for members in long functions or methods, arguably, you have two problems.

> I can hit `_` and my IDE’s code-completion tool immediately reveals all the members of the current class.

This convenience, however, doesn’t illustrate any inherent advantage to using underscore prefixes. Rather, it highlights a reliance on tooling; a crutch that compensates for code that lacks clarity or cohesion. In well-structured code, the surrounding context should be concise enough that developers can intuitively grasp which members are in play. When the cognitive load is low, there’s little need for such artificial hints.

## Inconsistent Semantics and Fragile Style

Prefixes are **fundamentally brittle**. They encode metadata into a name that the compiler cannot validate, and which no language construct enforces. If your team changes a field’s visibility from private to protected, is it still `_field`? Should you rename it? Refactor it across dozens of files? This style turns naming into ceremony instead of a clear, purposeful signal of intent.

By contrast, `this` **always means the same thing**. It is invariant. It never lies. You don't have to document or standardise it. It’s built into the language.

## Cross-Language Clarity

Some argue that underscore prefixes are acceptable in JavaScript or Python because of their limited support for access modifiers. That was once true, but modern JavaScript (via `#privateFields`) and TypeScript (via `private`, `protected`) now offer better ways to manage visibility. And TypeScript, in particular, mandates qualifying class members with `this.` making prefixes **entirely redundant**. Bringing C#’s underscore habits into TypeScript or JavaScript projects is **not just unnecessary; it’s regressive**.

## A Better Way Forward

The pushback against underscore prefixes isn’t pedantry. It’s about writing expressive, semantically rich code that leverages the full power of the language. **Clean code is intentional**. It uses the right constructs, in the right context, **with as little extraneous noise as possible**.

- Want to disambiguate members? Use `this.`
- Want to indicate access levels? Use access modifiers.
- Want semantic clarity? Use meaningful names.

Prefixes like `_` **add nothing** that the language doesn’t already offer, and in doing so, they subtract readability, introduce inconsistency, **and encourage bad habits** across codebases and teams.

## Conclusion

**Prefixing member variables with underscores in C# is not a best practice**, it’s a historical artefact, an unnecessary holdover from languages and tools that no longer dictate our workflows. It undermines many of the principles that modern C# promotes: clarity, consistency, expressiveness, and clean, readable code.

If you're still clinging to `_field`, take a moment to ask: what purpose is it serving that `this.field` doesn’t serve better?