# onixlabs.io

The ONIXLabs website: a static site built with [Astro](https://astro.build), served by GitHub Pages at
<https://www.onixlabs.io>.

## Getting started

Requires Node.js 24 (see `.nvmrc`).

```sh
npm ci
npm run dev        # http://localhost:4321 with live reload
```

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server. The Content Security Policy is only applied to production builds. |
| `npm run build` | `astro check` (types and content schemas), then a production build into `dist/`. |
| `npm run preview` | Serves `dist/` locally. |
| `npm run lint` | ESLint, type-aware, enforcing the TypeScript house style. |
| `npm test` | Unit tests (Vitest). |
| `npm run test:e2e` | Playwright tests against `dist/`, desktop and mobile: every page, SEO metadata, axe-core WCAG 2.2 AA checks in light and dark mode, and interactions. Run `npm run build` first. |
| `npx lhci autorun` | Lighthouse CI budgets (95+ in every category) against `dist/`. |
| `npm run images` | Regenerates the WebP renditions of bitmap-backed SVGs, the Open Graph image and the touch icon. |

## Where things live

```
src/
  content/            Site content: products, articles, contributors, technologies, Aero (YAML and Markdown)
  content.config.ts   Zod schemas for that content; invalid content fails the build
  pages/              Routes; file paths match the public URLs (/Products/DotNet/Core, ...)
  layouts/            BaseLayout (head, header, footer)
  components/         Shared Astro components
  seo/                Canonical URLs, titles and JSON-LD builders
  scripts/            The little client-side JavaScript the site uses (theme switch, contact prefill, download buttons, lazy video, outline scrollspy)
  styles/             The design system: tokens, base styles, effects and prose
public/               Files served as-is, including images at their existing /onixlabs/images/... URLs
tests/e2e/            Playwright tests
scripts/              Image generation scripts
```

Editing content is described in [CLAUDE.md](CLAUDE.md). The move from Blazor is recorded in
[MIGRATION.md](MIGRATION.md).

## Deployment

`.github/workflows/site.yml` runs lint, tests, the build, the end-to-end suite and Lighthouse on every pull request
and push. Pushes to `main` then deploy `dist/` to GitHub Pages.
