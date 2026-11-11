---
title: "Introduction to ONIXLabs Studio"
description: "How ONIXLabs Studio grew from a simple text editor into a free, open-source agentic development environment, with agents at every surface."
category: products
order: 1
path: /Documentation/Studio/Introduction-To-Studio
published: 2026-11-10
---

Only a few years ago, a day of software engineering meant a desk full of windows. An IDE, perhaps a text editor beside it, and a Markdown editor too. A handful of terminals, Docker Desktop, a database explorer, and an API client like Postman. Each tool lived in a window of its own.

That arrangement worked because most of the work was manual. An engineer spent long stretches in each window, writing the code, running the commands and reading the results by hand. It's how software has been built for decades.

## Enter AI

Then came AI: the wheel of the twenty-first century, and a genuine marvel of technology. As we brought agents into our own workflow, something unexpected happened. We spent more of our time waiting while an agent did the work, and that waiting time had to go somewhere. So we opened more IDEs, and worked on several projects in parallel.

The drawback was obvious within weeks. There were even more windows than before, with agents scattered like salt across them. Engineering had started to feel less like building software and more like window management.

It didn't help that almost every tool we used was born in a pre-AI era. To catch up, they bolted AI on, like a car towing a trailer. What engineers needed was a pickup truck: one vehicle, built from the ground up to do the whole job.

We tried the best of what was available. The JetBrains suite could embed Claude Code in its terminal. VS Code did much the same with a nicer interface, and it was our favourite. Cursor felt like VS Code with agentic bells and whistles, which, at the time, is largely what it was. Every one of them could get the job done. None of them felt coherent.

At **ONIXLabs**, we asked a simple question:

> What if everything we needed lived in one window, with agents working right alongside us?

## It Started With a Text Editor

The first thing we set out to build was modest: a text and Markdown editor. One place to edit pieces of text, that looked a little like a web browser, with a tab at the top for each document. Nothing complicated.

Then we started to question what we'd built, one "what if" at a time.

**What if it highlighted syntax**, so we could read code the way we would in an IDE? We replaced the plain text area with Monaco, the same editor surface that VS Code uses.

**What if we could run the code** as well as read it, like a REPL? We added a terminal, and the tooling to run what was in the editor.

**What if those terminals were first class**, good enough to replace the terminal app altogether? We made them so.

**What if an agent worked alongside every view?** Beside code, it could write the code for us. Beside Markdown, it could write and review documents. Beside a terminal, it could command the system when we didn't know the exact commands we needed.

By then we had a genuinely useful app, but it only solved half the problem. Text, code, Markdown and terminals now shared one window, which made the window management easier. But we had brought agents into the picture too, and they deserved more than a corner of a text editor. We had to stop and think.

## Starting Again, With a Bigger Brief

So we started again from scratch, with a much bigger brief:

- **Workspaces:** a full, language-agnostic IDE, good enough to replace JetBrains, VS Code and Cursor
- **Repositories:** full version control over our whole code estate, local and remote
- **Tools:** container management, a database explorer, an API explorer, and the rest of the toolkit that used to live in separate windows

And running through all of it, one principle: **agents at every surface**. Not a chat panel beside the work, but agents inside it, helping wherever we were working. Studio became an **ADE**, an _agentic development environment_. Where a traditional IDE is built around a person editing files, with an AI chat added on the side, an ADE is built around people and agents working together in the same project, the same terminals and the same editor.

Studio has grown far beyond that brief. Today it's over a million lines of code, and a mature agentic development environment, built in a matter of months.

## Agents at Every Surface

The code, Markdown and terminal menus all offer **Ask the Agent**, so you can hand over whatever you're looking at. Changes an agent makes to an open document land through the editor you're using, and agents open, read and type into the same terminals you do, in plain sight.

Each agent tab holds a **live, persistent session**: a real conversation that stays open and keeps its context, rather than a transcript replayed from scratch. Sessions run on the **Claude Agent SDK** or the **OpenAI Codex SDK**, and you can also talk directly to models from Anthropic, OpenAI, xAI, Google, DeepSeek, Ollama and any OpenAI-compatible endpoint, with **MCP** servers supported throughout. When several agents are running, **Mission Control** gives each its own column on one screen, so you can start, follow and redirect them all from one place.

Agents are trusted with real work, so they work within real limits. They write inside your workspace by default, their transcripts show each file they read and each command they run, and per-tool policies decide what each one may do, must ask first, or may never touch. Shell commands run in the operating system's sandbox where it's available, and running one outside it is a permission of its own, marked in the transcript whenever it happens.

## What Studio Is Today

Here's a short tour of what Studio ships, all in one window.

### Workspaces

Open a project and Studio understands it on its own terms, whether it's **.NET**, **Node**, **Java and Kotlin**, **Python**, **C and C++**, **Rust** or **Go**, and mixed repositories are fine. Completion, navigation, inline errors and refactoring come from the same language servers those communities maintain, and a single Error List gathers every problem in the workspace. Set breakpoints and step through code with .NET, Node and Python, and find, run and debug tests with a **Tests panel** that supports the major frameworks of each language.

### Repositories

Review changes inline or side by side, follow the commit graph across every branch, and keep several branches checked out at once as worktrees, using the git you already have installed. With the GitHub plugin, your pull requests, issues and CI runs sit beside your branches.

### Tools

See and control your containers on Docker or Podman, and read their logs or open a shell inside them. The **Database Explorer** connects to PostgreSQL, SQLite and Neo4j, browses the schema and runs SQL and Cypher queries with results in a grid. The **API Explorer** composes and sends requests and saves them with your project as plain JSON collections. The **Packages panel** keeps a project's dependencies current across npm, NuGet, PyPI, Cargo, Go modules, Maven and Gradle, vcpkg and Conan, and the model manager runs local models through Ollama.

### Editors

The code editor is still at the heart of it. Beside it, the Markdown editor formats as you type, with live Mermaid diagrams and KaTeX maths, spelling and grammar review, and export to PDF. The binary editor reads files in 64 KB blocks, so it opens files far too large for an ordinary editor, and its decoder plugins disassemble native, JVM, WebAssembly and .NET binaries.

### Yours to Arrange

Panels dock, split, stack, float or pull out into windows of their own. Save an arrangement as a layout, or start from the Default, Version Control or Agentic Engineering layouts. Language servers, debug adapters, test frameworks, package managers, agent harnesses, and container and database engines all arrive as plugins, so you install what your work needs and nothing else.

## From Window Managers to Agentic Engineers

In a matter of months, we went from managing windows, to building a text editor, to working as agentic engineers with a whole estate of tools in one place.

And then we gave it away. **ONIXLabs Studio** is free and open source under the MIT License, and runs on macOS, Windows and Linux. It's in beta, so expect rough edges, and releases aren't signed yet, so macOS and Windows will warn you the first time it launches.
