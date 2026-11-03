# Migration from Blazor WebAssembly to Astro

This branch replaces the Blazor WebAssembly site with a static Astro site that has the same content, design and
URLs. Before, the HTML GitHub Pages served was an empty shell until the .NET runtime booted. Now every page's full
content is in the HTML.

## Stack

| Before | After |
|---|---|
| Blazor WebAssembly on .NET 9 | Astro 7, `output: 'static'` |
| Razor components | Astro components (`src/components/`) |
| Scoped `.razor.css` and `wwwroot` CSS | Scoped `<style>` blocks and `src/styles/global.css` |
| Bootstrap, Font Awesome, Poppins and animate.css copied into `wwwroot` (about 2,400 files, 28 MB of Font Awesome) | A small custom design system (`src/styles/`), fonts from npm, and only the Font Awesome icons used, inlined as SVG |
| Markdown fetched and converted in the browser with Markdig | Markdown rendered at build time (remark/rehype) |
| Hard-coded copy in `.razor` pages | Typed content collections in `src/content/`, validated by Zod |
| `peaceiris/actions-gh-pages` pushing to the `gh-pages` branch | `actions/deploy-pages`, after lint, tests and Lighthouse pass |
| No tests | Vitest unit tests, Playwright end-to-end tests, axe-core accessibility checks, Lighthouse CI |

## URL inventory

Every route the Blazor site served, except the tools, is built at the same path. `tests/e2e/support/site-pages.ts`
checks each one.

| Path | Status |
|---|---|
| `/` | ✅ |
| `/Products` | ✅ (canonical `/Products/`, see below) |
| `/Products/Aero` | ✅ |
| `/Products/DotNet/Core`, `/Numerics`, `/Security` | ✅ |
| `/Products/Corda/Core`, `/Identity-Framework`, `/Business-Network-Management-System` | ✅ |
| `/Products/Kotlin/Core`, `/Projection`, `/Validation` | ✅ |
| `/Consulting`, `/Contact` | ✅ |
| `/Documentation` | ✅ (canonical `/Documentation/`) |
| `/Documentation/Aero/Introduction-To-Aero` | ✅ |
| `/Documentation/CSharp/Syntactic-Sugar-Bitter-Aftertaste`, `/Underscore-Overkill` | ✅ |
| `/Documentation/Corda/Flow-Design-Guidelines-1`, `-2`, `-3`, `/Relational-Data-And-Pointers` | ✅ |
| `/Documentation/Number-Theory/The-Problem-With-Decimals` | ✅ |
| `/Contributors/Matthew-Layton`, `/Laura-Perez-Crespo`, `/Adam-Dry`, `/Ryan-Gledhill` | ✅ |
| `/Tools` and the seven `/Tools/*` pages | ❌ Not migrated: moving to a separate site. These now return the 404 page. |

### URL behaviour that changed

- **Case sensitivity.** Blazor's router matched URLs case-insensitively, so `/products/dotnet/core` worked.
  GitHub Pages is case-sensitive, so only the exact casing above resolves now. Check Search Console for traffic to
  differently cased URLs before cutover.
- **`/Products` and `/Documentation`.** Each is both a page and the parent directory of other pages. I couldn't
  confirm whether GitHub Pages serves `Products.html` for `/Products` or redirects to `/Products/` when a
  `Products/` directory also exists. The build emits both files, so the page loads either way, and canonical URLs,
  navigation and the sitemap use `/Products/` and `/Documentation/`, which resolve the same way under both
  behaviours.
- **Unknown URLs** now return a real HTTP 404 with the existing "Yikes!" page. Before, `404.html` was a copy of the
  SPA shell, so every unknown URL loaded the app.

## Changes from the Blazor site

The site was first ported with the Blazor design intact, then redesigned: quiet and product-led, with alternating
light and near-black bands, rounded tiles, the brand gradient used sparingly, and CSS-only scroll-driven motion (see
the design system in CLAUDE.md). These
deliberate changes came out of the SEO and accessibility work:

**SEO**
- Every page has its own title, meta description, canonical URL, Open Graph and Twitter tags. Before, every URL
  declared `https://onixlabs.io/` as canonical, which told search engines that all pages were the home page.
- The canonical host is now `https://www.onixlabs.io`, matching `CNAME`. The old tags named the apex.
- Titles put the page first (`Numerics Library for .NET | ONIXLabs`) instead of `ONIXLabs | ...`.
- JSON-LD on every page: Organization and WebSite; BreadcrumbList on inner pages; SoftwareSourceCode for each
  library; SoftwareApplication for Aero; TechArticle for articles; ProfilePage/Person for contributors.
- `logo-og.png` was an empty (0-byte) file, so link previews had no image. It's now a generated 1200×630 card.
- `sitemap-index.xml` and `robots.txt` are generated.

**Accessibility (axe-core reports no WCAG 2.2 AA violations on any page, in either theme)**
- There's a skip link, a labelled main navigation, `aria-current` on the current page, and labels on icon-only
  links.
- Each page has a single `<h1>` and an ordered heading outline. Subtitles ("callouts") are paragraphs rather than
  `<h2>`, and card titles moved from `<h1>` to `<h3>`.
- The theme toggle was a hidden checkbox that the keyboard couldn't reach. It's now a `role="switch"` button. The
  theme is also applied before first paint, so dark-mode visitors no longer see a light flash.
- Contrast fixes: muted text on the product gradients, footer text, links on the grey background, and
  outline-secondary buttons. Links in articles are underlined.
- External links announce "(opens in a new tab)". Code blocks and tables that scroll can be focused with the
  keyboard.
- Animations respect `prefers-reduced-motion`.
- The documentation and biography layouts now adapt to mobile; they were fixed-width columns before. The docs
  sidebar no longer scrolls inside a fixed-height box, and it opens the current article's category. The
  Documentation nav link now also shows on mobile.
- The contact form has autocomplete hints and no `autofocus`, and its labels float as you type.

**Performance**
- No .NET runtime download. Pages ship about 125–240 KB in total.
- SVGs that wrapped large embedded bitmaps are served as WebP: the home page mock-up went from 1.2 MB to 34 KB,
  and each glass icon from about 330 KB to 5 KB.
- Lighthouse locally on five representative pages: Performance 98–100, and 100 in Accessibility, Best Practices and SEO.

**Content**
- Product descriptions are stored once and reused wherever the product appears. Before, the Numerics description
  was copied into three pages, with one copy already drifting (a curly vs straight apostrophe).
- "View Nuget Packages" is now "View NuGet Packages".
- The contact form gained a Formspree honeypot field (`_gotcha`) to cut spam.

## Content Security Policy

Astro emits a `<meta http-equiv="content-security-policy">` with SHA-256 hashes for every script and style, plus
the directives in `astro.config.ts`: `default-src 'self'`, `form-action https://formspree.io`, `object-src 'none'`,
and so on. The end-to-end tests fail on any console error, so a CSP violation fails CI.

GitHub Pages can't send response headers, so `frame-ancestors` (clickjacking protection), HSTS, CSP violation
reporting and the other header-only protections aren't possible here. If you need them, put Cloudflare (or a
similar proxy) in front of Pages.

## Cutover checklist

Nothing has been pushed or deployed. In order:

1. **Review and merge this branch** through a pull request. The Site workflow runs on the PR.
2. **Switch the Pages source.** In Settings → Pages, change "Build and deployment" from "Deploy from a branch"
   (`gh-pages`) to **GitHub Actions**. Until you do, the deploy job fails harmlessly and the old site stays up.
   Re-run the workflow after switching.
3. **Verify production** at `https://www.onixlabs.io`: spot-check pages, then confirm that `/Products` and
   `/Documentation` load, both with and without a trailing slash. A custom domain redirects the `*.github.io`
   address, so there's no separate staging URL. To check the exact build beforehand, run `npm run build` and
   `npm run preview`.
4. **Search Console:** submit `https://www.onixlabs.io/sitemap-index.xml` and request reindexing of the home page.
5. **Branch protection on `main`:** require pull requests and the "Lint, test and build" check, and block force
   pushes.
6. Once the new site has been stable for a while, delete the `gh-pages` branch.

## Open items for the owner

- **Tools redirects.** When the tools site has a URL, add entries to Astro's `redirects` option in
  `astro.config.ts`, for example `'/Tools/Hash-Generator': 'https://tools.example/hash-generator'`. Astro generates
  a meta-refresh page with a canonical link for each, which is the best a static host can do. There are eight URLs:
  `/Tools`, `/Tools/Ascii-Table`, `/Tools/Guid-Generator`, `/Tools/Token-Generator`, `/Tools/Base-Encoder`,
  `/Tools/Hash-Generator`, `/Tools/Color-Picker`, `/Tools/Ratio-Calculator`.
- **Article authors and dates.** Articles have no `author` or `published` frontmatter, because the Blazor site
  didn't record them. Adding them (e.g. `author: matthew-layton`, `published: 2024-05-01`) adds a byline and
  enriches the TechArticle structured data.
- **Home page `<h1>`.** It's still "Introducing AERO", matching the design. A heading that names ONIXLabs and what
  it does would be a stronger SEO signal, if you want to change the copy.
- **Theme persistence.** The theme choice is kept in `sessionStorage`, as before, so it resets in each new
  session. Switching to `localStorage` would make it stick.
- **Development dependencies.** `npm audit` reports advisories in dev-only tooling (minimatch via ESLint;
  basic-ftp via Lighthouse). None of them ship to the site, and production dependencies report none. Re-check when
  upstream fixes land.
- **Live-site bug.** On the current Blazor site, loading a documentation article directly (e.g.
  `/Documentation/Corda/Flow-Design-Guidelines-1`) shows "An unhandled error has occurred". The Astro build fixes
  this.
