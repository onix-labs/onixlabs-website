# CLAUDE.md

Guidance for agents (and people) working on the ONIXLabs website. Most changes here are content updates: keeping
product information current, adding articles, updating bios. Read this before editing.

## How the site is built

Astro 7, static output, deployed to GitHub Pages. Every page is rendered to HTML at build time. The only
client-side JavaScript is the theme switch, the contact-form prefill, the download buttons (which swap in the installer
for the visitor's platform and hide on phones and tablets), the Player video (which starts when it scrolls near), the
article outline's scrollspy, and a hold before the Studio hero's first turn. The mobile menu (popover API) and the docs
sidebar (`<details>`) work without it. Keep it that way: content must never depend on JavaScript to appear.

The build looks up the latest Studio and ONIXPlayer releases on GitHub (`src/collections/load-studio-release.ts` and
`load-player-release.ts`). If that fails the build still succeeds, and the download buttons fall back to the releases
pages. Every hour CI checks whether the live site links each app's latest release, and rebuilds and deploys it if not.
The download button offers exactly one installer; Safari and Firefox won't report a Mac's processor, so for them it's
judged from the graphics processor (`infer-mac-architecture.ts`), and a Mac that can't be judged gets Apple silicon.

## Redesign in progress

This branch is rebuilding the site on a new design language. `review.md`, if present, records the direction.

- Redesigned: `/`, `/Products`, `/Products/Studio`, `/Products/Aero`, the library pages (`/Products/DotNet`, `/Products/Corda`,
  `/Products/Kotlin`, built from `library-pages.yaml`) and every product under them, `/Documentation`, `/About`,
  `/Engineering-With-AI`, `/Consulting`, `/Contact` and `/Legal`. `LibraryHero` opens the library, product, Aero,
  Consulting and Contact pages. The contributor profiles (`/Contributors/<Name>`) are redesigned too.
- `/design` is the design language, served by the dev server only; production builds generate no pages for it. Its
  pages live in `src/design/pages/`, with the table of contents in `src/design/design-navigation.ts`. Add new patterns
  here before using them on a page, and remove a page's specimens when the pattern goes.

## Design system

The look is the Stride design system (`onixlabs-stride`), a soft-UI language, with the ONIXLabs brand
layered on top for marketing moments. Surfaces sit raised above a mid-grey page with a light top edge, a dark bottom
edge and soft shadows; corners are very rounded (squircles); the primary is monochrome (near-black in light,
near-white in dark). Light and dark get equal attention on every page: the site follows the visitor's OS setting,
with a toggle. Headlines are very large, full-bleed bands alternate, and the brand gradient is used generously:
gradient text, the eight swatches, family colour blocks, the hero bloom and the glows behind the glass icons. Reuse
what exists before adding new styles:

- **Tokens** (`src/styles/tokens.css`): brand colours, product-family colours, type scale, spacing, and the
  light and dark palettes, which switch on `[data-theme]`. `.tone-dark` forces the dark palette on a band in
  either theme; `.tone-alt` is the alternate band. Use the variables; don't hard-code colours. Where Stride's values
  fall below WCAG AA, the tokens deepen them and mark the change "AA". `--edge-shadow` draws a surface's light top edge
  and dark bottom edge as inset shadows (set `--edge-top` and `--edge-bottom`); never draw them as borders, which taper
  and render jagged around rounded corners.
- **Base** (`src/styles/base.css`): layout (`.container`, `.container-wide`, `.section`, `.grid-2/3/4`), the
  two-tone headline (`.headline-muted`), `.eyebrow`, `.lead`, `.surface`, `.tile`, `.badge`, `.button` and its
  variants (`-primary`, `-danger`, `-spectral`, `-ghost`), the `.link-cta` ("Learn more ›"), the product `.emblem` (with
  `.family-<id>`), `.icon-chip`, `.shelf-mobile` (the sideways-scrolling rows on phones) and form fields.
- **Effects** (`src/styles/effects.css`): `.gradient-text` (one phrase per headline; it uses a darker set of stops on
  light backgrounds to keep its contrast, and bleeds `--text-bleed` above and below so descenders aren't cut off: a rule
  that sets its margin must subtract that), `.swatches`, `.family-block`, `.hero-bloom`, `.window-light`, `.marquee`, and
  the motion classes: `.rise` and `.blur-in` (page-load entrances), `.reveal`, `.reveal-scale`, `.settle` and
  `.zoom-arrive` (scroll-driven entrances) and `.scroll-progress` (the spectrum along the header). Motion is
  entrance-only: content animates in as it arrives and never animates on the way out, and nothing in a hero starts at
  `opacity: 0` (see the rendering rules). All motion is CSS-only, is off under `prefers-reduced-motion`, and leaves
  content fully visible where it can't run. The electrons in `AiCircuitSection` are CSS too: their keyframes are
  computed in the component and emitted as a stylesheet whose hash it adds with `Astro.csp.insertStyleHash`. Don't use
  SMIL to animate a CSS property (`opacity`, `stroke-*` and so on): Firefox applies it as an inline style, which the CSP
  refuses. `hold-first-showcase-turn.ts` only delays a CSS animation that runs without it.
- **Components** (`src/components/`): `src/components/ui/` holds the Stride controls (`Card`, `Accordion`, `Modal`,
  `Tabs`, form inputs and so on), shown on the design pages and available to any page. `StudioHero` is the home page
  hero and `LibraryHero` opens the library, product, Aero, Consulting and Contact pages. `SectionHeader` gives the eyebrow, `<h2>`
  and lead of each section; `GlassBand` (a band of copy beside a glowing glass icon), `LibrarySection`, `ProductTile`,
  `FamilyTile`, `TeamTile`, `PrinciplesBento`, `TechnologyMarquee`, `TalkToUsSection` and `Button` cover most content.
  `StudioFeature` sets a Studio screenshot beside its `FeaturePoints` in a band. `GlassIcon` renders a 3D glass icon
  and `GlassAura` the icon over its glow.
- **Typography:** the self-hosted Poppins for all text, JetBrains Mono for code and technical labels. Headlines have
  negative tracking; the second phrase of a headline can go grey with the `highlight` prop, or take
  the gradient with `highlightStyle="gradient"`.
- **Icons** are [Phosphor](https://phosphoricons.com) icons (duotone weight, MIT) in `src/icons/`, named as Phosphor
  names them, without the `-duotone` suffix, and rendered with `<Icon name="…" />`, usually inside an `.icon-chip`.
  `arrow-right-bold` is the one exception, in Phosphor's bold weight, for the arrow on a ghost button. Buttons carry no
  leading icon; that arrow is the only icon a labelled button has. The `fa-*` icons are Font Awesome Free (CC BY 4.0,
  licence notice inside each file) and only for `PlayerWindow`, which replicates the real ONIXPlayer interface. Delete an
  icon when its last use goes: `src/design/pages/iconography.astro` shows whatever is in the folder.

## Rendering and performance rules

These came from real defects on iPhones and from the Lighthouse budget, so they aren't optional.

- **No runtime blur on anything that animates or scrolls into view.** iOS Safari clips a `filter: blur()` layer to its
  parent's box while an ancestor is animated, and re-blurs it every frame. Glows are rendered ahead of time instead:
  `scripts/generate-auras.ts` (part of `npm run images`) blurs each glass icon and the Aero image into `<name>-aura.webp`
  and `<name>-aura-dark.webp`, which `GlassAura` and `AeroShowcase` show behind the image. The only runtime blurs left are
  static backdrops (`.window-light`, `StudioWindow`'s glow, the marquee's logo glow) and the hero text's `blur-in`.
- **Keep movement on the compositor.** A browser only runs an animation off the main thread if it can composite every
  property in it: `transform`, `translate`, `scale`, `opacity` and filters that don't move pixels (`brightness`,
  `grayscale`, not `blur`). One `z-index`, `visibility` or `blur` in the same keyframes keeps the whole animation on the
  main thread, where it stutters while a first visit is still loading. Give those their own animation on the same timing,
  as `showcase-stack`, `shot-wait` and `blur-in-sharpen` do.
- **Edges are inset shadows**, via `--edge-shadow`, never top and bottom borders.
- **Nothing in a hero starts at `opacity: 0`.** The largest element on a phone's first screen is usually the hero copy
  or the first screenshot; hiding it, even briefly, is what Lighthouse measures as LCP. Entrances may slide, scale or
  sharpen, and `rise` may fade below the fold, but the hero's first paint must show its copy and image. Layering is
  fine where a fade isn't: `StudioHero` holds its rising copy beneath the opaque front screen (`copy-behind`), so the
  blurred text never washes over the window.
- **Images are served at the size they're shown.** The Studio screenshots have half-size copies (`-856.webp`, from
  `scripts/generate-studio-sizes.ts`) and a `srcset` with `sizes` wherever they appear; the first screenshot in a hero
  is `loading="eager"` with `fetchpriority="high"`, the rest lazy. New large images need the same treatment.
- **Video starts on demand.** `video[data-lazy-video]` carries its source in `data-src`, and
  `initialise-lazy-video.ts` loads and plays it when it scrolls near; keep videos short loops (the Player's is 30s,
  about 1.8MB) with a poster image beneath.
- **Budgets:** Lighthouse must score at least 95 in every category on the pages in `lighthouserc.cjs` (CI enforces it),
  and the axe tests must pass in both themes with no exclusions. Run them before declaring a visual change done.
- **Test on WebKit.** The e2e suite has a `webkit-mobile` project (an iPhone) as well as Chromium desktop and mobile;
  WebKit differs on filters, form controls and animations. WebKit logs a CSP refusal for the stylesheet it applies to
  its own `<select>` picker; `pages.spec.ts` ignores that one message, and nothing else.

## Content model

All content lives in `src/content/` and is validated by the Zod schemas in `src/content.config.ts`. **The schema is
the contract.** If an edit doesn't match it, `npm run build` fails; fix the content, don't loosen the schema
without a reason. When a field loses its last reader, remove it from the schema and the content rather than leaving it.

| Collection | Files | Renders |
|---|---|---|
| `products` | `src/content/products/<family>-<name>.yaml` | `/Products/<Family>/<Name>` and the sibling tiles on other product pages |
| `productFamilies` | `src/content/product-families.yaml` | The .NET, Corda and Kotlin tiles on `/Products` and the family-level copy on product pages |
| `libraryPages` | `src/content/library-pages.yaml` | `/Products/DotNet`, `/Products/Corda` and `/Products/Kotlin`: a hero and a band for each package |
| `aero` | `src/content/aero.yaml` | The principles and architecture modules on `/Products/Aero` |
| `studio` | `src/content/studio.yaml` | `/Products/Studio`: one feature for each screenshot, with the points that explain it, and the capabilities around them |
| `articles` | `src/content/articles/<folder>/<slug>.md` | `/Documentation/...` articles, listed by `category` on the `/Documentation` hub (Products, Foundations, Engineering Standards, Corda) |
| `contributors` | `src/content/contributors/<slug>.md` | `/Contributors/<Name>` and the team tiles on the home, About and other profile pages |
| `technologies` | `src/content/technologies.yaml` | The technology logos on the home page (sorted by `id`) |
| `policies` | `src/content/policies/<slug>.md` | `/Legal/<Name>` policy pages, listed by `group` (Legal, Responsibility, Trust) on the `/Legal` hub and in the footer |

Site-wide settings (canonical host, social links, contact form endpoint, Calendly link, and the company's legal details,
which `/Legal/Company-Information` uses) are in `src/config/site.ts`. Navigation is in `src/config/navigation.ts`;
documentation categories and their order in `src/config/documentation-categories.ts`.

Marketing copy that isn't product information (the home page, Consulting, Contact, About and the hero text on
Products and Aero) lives directly in the `.astro` files under `src/pages/`.

### Product fields that matter

- `path` is the public URL. **Never change an existing `path`**: the URLs are indexed and linked from elsewhere,
  and GitHub Pages can't issue server-side redirects.
- `lead` is the hero's standfirst: one short statement. `callout` is the one-line pitch on the sibling tiles.
- `summary` is the description in the page's structured data; `description` is the meta description for search
  results: 50 to 170 characters, factual, no keyword stuffing.
- `sections[].features[].body`: separate paragraphs with a blank line.
- On a library page (`library-pages.yaml`), each package has a short `summary` (standfirst) and exactly two `details`
  paragraphs: the problem, then how and why the package solves it. Keep them abstract: the kinds of problem, not type
  names.

## Keeping product content current

Each product's source of truth is its repository (`repositoryUrl`). When updating a product:

1. Read the repository's README, release notes or changelog, and public API changes since the content was last
   updated (`git log -- src/content/products/<file>` shows when that was). For a large library, inventory the public
   API first; the pages for .NET, Kotlin and Aero were rewritten from such inventories.
2. Update the product's YAML: add, remove or reword `features` to match what the library actually ships, and update
   `lead`, `callout`, `summary` and `description` when the headline capabilities change.
3. Don't invent claims. Every statement must be supported by the repository, its docs or its releases.
4. Keep the existing voice: confident, concrete, British English spelling ("modernise", "specialised").
5. Run the checks below, then open a pull request that lists the source for each change.

## Adding things

- **An article:** add `src/content/articles/<category>/<slug>.md` with the frontmatter the schema requires. The
  `path` must start with `/Documentation/`, and never changes once published, even if the article moves category. Give it
  a `published` date. Use `##` and deeper headings in the body; the title is rendered as the page's `<h1>`, and the `##`
  headings make its outline. A new category also needs an entry in `src/config/documentation-categories.ts` and the
  schema's `category` enum.
- **A product:** add a YAML file in `src/content/products/`, with an icon under `public/onixlabs/images/icons/`,
  then add its URL to `tests/e2e/support/site-pages.ts`. If its family has a library page, add its band to
  `library-pages.yaml` too.
- **A contributor:** add a Markdown file in `src/content/contributors/`, with an `accent` for their title, and a 640×640 photo under
  `public/onixlabs/images/contributors/`, then add the URL to `tests/e2e/support/site-pages.ts`.
- **An icon:** copy its SVG from `node_modules/@phosphor-icons/core/assets/duotone/` into `src/icons/`, dropping the
  `-duotone` suffix from the file name, and use `<Icon name="..." />` with the Phosphor name.
- **A glass icon:** export a light and a `-dark` WebP from Affinity, 640×640 with the high quality preset, into
  `public/onixlabs/images/icons/glass/`, then run `npm run images` to render its glows (`-aura.webp` and
  `-aura-dark.webp`). Content refers to glass icons by file name (`glass: <name>`).
- **A Studio screenshot:** add `<id>-l.webp` and `<id>-d.webp` (1712×1112) to `public/onixlabs/images/studio/`, list the
  screen in `src/config/studio-screens.ts`, and run `npm run images` for the half-size copies.
- **A bitmap-backed SVG** (an SVG that embeds `data:image`): add it under `public/onixlabs/images/`, run
  `npm run images`, and reference the generated `.webp`.

## Legal and policy pages

The policies in `src/content/policies/` describe what ONIXLabs actually does, as audited on 8 November 2026: the site sets
no cookies, runs no analytics, and receives personal data only through the contact form (Formspree), email (Namecheap
Private Email) and Calendly. **If that changes, update the policies in the same change:** adding analytics or any
non-essential cookie or storage needs consent before it's set, a consent control, and new Cookie and Privacy Policy
text. Never add a commitment, certification or practice to a policy that hasn't been confirmed by the director. Update
`updated` in a policy's frontmatter whenever its text changes (spelling included), and `Expires` in
`public/.well-known/security.txt` before it lapses. These pages aren't legal advice; changes of substance should be
checked by a qualified UK adviser.

## Checks to run before every pull request

```sh
npm run lint
npm test
npm run build
npm run test:e2e
npx lhci autorun
```

CI runs the same checks. Fix failures; never skip or weaken a test to get green. `npm run test:e2e` needs the
Playwright browsers (`npx playwright install chromium webkit`) and a prior build; it serves `dist/` itself.

## Rules

- **SEO:** every page needs one `<h1>`, a unique title and a meta description. `BaseLayout` takes these as props
  and emits the canonical URL, Open Graph tags and JSON-LD.
- **Accessibility:** give every image meaningful `alt` text, or `alt=""` if it's decorative. Links that open a new
  tab must say so (`(opens in a new tab)` in visually hidden text), and icon-only links need visually hidden text.
  Keep text contrast at WCAG AA (4.5:1) in both themes, against the surface the text actually sits on (a tile is lighter
  than the dark band behind it). The axe tests run in both themes on Chromium and WebKit, and nothing is excluded.
- **CSP:** Astro hashes every inline script and style into a `<meta>` Content Security Policy. Don't add inline
  `style="..."` attributes or event handlers (set CSS variables from scripts with `style.setProperty` instead), and
  don't load third-party scripts, fonts or images without updating the policy in `astro.config.ts`.
- **Layout:** content spans the nav's width (`.container-wide`); don't cap a section's content at a narrower
  `max-width`. The one exception is a centred hero standfirst, which keeps a reading measure.
- **Spelling:** everything a visitor reads is British English: "colour", "behaviour", "organisation", "-ise" not "-ize",
  "licence" for the noun (the verb stays "license"), "towards". Code is American English: identifiers, CSS, comments
  and file names. Keep established names as they are: product and API names (`ISerializationService`, .NET's "generic
  math"), the "MIT License", and quotations. A computer program stays a "program".
- **TypeScript:** follow the house style that `eslint.config.js` enforces: explicit types, no `any`, one exported
  type per file, named exports.
- **Tidiness:** when a component, icon, image, style or content field loses its last user, delete it in the same
  change. Nothing in `src/`, `public/` or the schema should exist only for history. The exception is the logo copies
  that other ONIXLabs repositories' READMEs link to as raw files on `main`:
  `OnixLabs.Web/wwwroot/onixlabs/images/logo/logo-full-light.svg` and
  `src/assets/images/logo/full/original/original-md.png`. Keep them at those paths, and update them when the logo changes.
