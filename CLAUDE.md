# CLAUDE.md

Guidance for agents (and people) working on the ONIXLabs website. Most changes here are content updates: keeping
product information current, adding articles, updating bios. Read this before editing.

## How the site is built

Astro 7, static output, deployed to GitHub Pages. Every page is rendered to HTML at build time. The only
client-side JavaScript is the theme switch, the contact-form prefill, the tabs, the pointer spotlight, the download
buttons, which swap in the installer for the visitor's platform, the article outline's scrollspy, and a hold before the Studio hero's first turn. The mobile menu (popover API) and the docs
sidebar (`<details>`) work without it. Keep it that way: content must never depend on JavaScript to appear.

The build looks up the latest Studio and ONIXPlayer releases on GitHub (`src/collections/load-studio-release.ts` and
`load-player-release.ts`). If that fails the build still succeeds, and the download buttons fall back to the releases
pages.

## Redesign in progress

This branch is rebuilding the site on a new design language. `review.md`, if present, records the direction.

- `/`, `/Products`, `/Products/Studio`, `/Products/DotNet`, `/Documentation`, `/About` and `/Engineering-With-AI` are redesigned. The other `/Products/...` pages, `/Consulting` and `/Contact` are the previous
  site's pages, not yet redesigned; `PageHero`, `LocalNav`, `FeatureCard`, `ProductCard` and `ContributorCard` were built for those.
- `/archive/Contributors` holds the contributor pages, so their paths sit under `/archive` (the schema requires it).
- `/design` is the design language, served by the dev server only; production builds generate no pages for it. Its
  pages live in `src/design/pages/`, with the table of contents in `src/design/design-navigation.ts`. Add new patterns
  here before using them on a page.

## Design system

The look is the Stride design system (`onixlabs-stride`), a soft-UI language, with the ONIXLabs brand
layered on top for marketing moments. Surfaces sit raised above a mid-grey page with a light top edge, a dark bottom
edge and soft shadows; corners are very rounded (squircles); the primary is monochrome (near-black in light,
near-white in dark). Light and dark get equal attention on every page: the site follows the visitor's OS setting,
with a toggle. Headlines are very large, full-bleed bands alternate, and the brand gradient is used generously:
aurora glows, gradient text, the eight swatches, family colour blocks and the hero bloom. Reuse what exists before
adding new styles:

- **Tokens** (`src/styles/tokens.css`): brand colours, product-family colours, type scale, spacing, and the
  light and dark palettes, which switch on `[data-theme]`. `.tone-dark` forces the dark palette on a band in
  either theme; `.tone-alt` is the alternate band. Use the variables; don't hard-code colours. Where Stride's values
  fall below WCAG AA, the tokens deepen them and mark the change "AA".
- **Base** (`src/styles/base.css`): layout (`.container`, `.container-wide`, `.section`, `.grid-2/3/4`), the
  two-tone headline (`.headline-muted`), `.eyebrow`, `.lead`, `.surface`, `.tile`, `.badge`, `.button` and its
  variants (`-primary`, `-danger`, `-spectral`, `-ghost`), the `.link-cta` ("Learn more ›"), the product `.emblem` (with
  `.family-<id>`), `.icon-chip`, `.shelf-mobile` (the sideways-scrolling rows on phones) and form fields.
- **Effects** (`src/styles/effects.css`): `.gradient-text` (one phrase per headline; it uses a darker set of stops on
  light backgrounds to keep its contrast, and bleeds `--text-bleed` above and below so descenders aren't cut off: a rule
  that sets its margin must subtract that), `.swatches`, `.family-block`, `.hero-bloom`, `.mesh`, `.aurora`, `.spectral`, `.spotlight`,
  `.marquee`, `.brand-rule`, and the motion classes: `.rise` and `.blur-in` (page-load entrances), `.mask-line`
  (headline slide-up), `.reveal`, `.reveal-scale` and `.settle` (scroll-driven entrances), `.recede` (hero copy fading
  as it scrolls away), `.zoom-through` (zooms in on arrival, then zooms, blurs and fades on leaving: for sticky elements), `.highlight` (statements that brighten in turn), `.scroll-progress` (the spectrum along the
  header) and the sticky zoom sequence (`.zoom-stage` > `.zoom-sticky` > `.zoom-target`). All motion is CSS-only, is
  off under `prefers-reduced-motion`, and leaves content fully visible where it can't run. The one exception is the
  electrons in `AiCircuitSection`, which use SVG's native SMIL animation to follow their tracks; still no JavaScript.
  `hold-first-showcase-turn.ts` only delays a CSS animation that runs without it.
- **Components** (`src/components/`): `src/components/ui/` holds the Stride controls (`Card`, `Accordion`, `Modal`,
  `Tabs`, form inputs and so on). `StudioHero` is the home page hero. `SectionHeader` gives the eyebrow, `<h2>` and
  lead of each section; `CapstoneTile`, `ProductTile`, `FeatureTile`, `ArticleTile`, `TeamTile`, `TechnologyMarquee`,
  `TalkToUsSection` and `Button` cover most content. `StudioFeature` sets a Studio screenshot beside its `FeaturePoints` in a band.
- **Typography:** the self-hosted Poppins for all text, JetBrains Mono for code and technical labels. Headlines have
  negative tracking; the second phrase of a headline can go grey with the `highlight` prop, or take
  the gradient with `highlightStyle="gradient"`.
- **Icons** are [Phosphor](https://phosphoricons.com) icons (duotone weight, MIT) in `src/icons/`, named as Phosphor
  names them, without the `-duotone` suffix, and rendered with `<Icon name="…" />`, usually inside an `.icon-chip`.
  `download-simple` is the one exception, in the regular weight, because it reads badly in duotone, and
  `arrow-right-bold` is Phosphor's bold weight, for the arrow on a ghost button. The `fa-*` icons are
  Font Awesome Free (CC BY 4.0, licence notice inside each file) and only for `PlayerWindow`, which replicates the real
  ONIXPlayer interface. `GlassIcon` renders the 3D glass
  icons.

## Content model

All content lives in `src/content/` and is validated by the Zod schemas in `src/content.config.ts`. **The schema is
the contract.** If an edit doesn't match it, `npm run build` fails; fix the content, don't loosen the schema
without a reason.

| Collection | Files | Renders |
|---|---|---|
| `products` | `src/content/products/<family>-<name>.yaml` | `/Products/<Family>/<Name>` and the "other products" cards on sibling product pages |
| `productFamilies` | `src/content/product-families.yaml` | The .NET, Corda and Kotlin tiles on `/Products` and the family-level copy on product pages |
| `aero` | `src/content/aero.yaml` | The principles and architecture modules on `/Products/Aero` |
| `studio` | `src/content/studio.yaml` | `/Products/Studio`: one feature for each screenshot, with the points that explain it, and the capabilities around them |
| `articles` | `src/content/articles/<folder>/<slug>.md` | `/Documentation/...` articles, listed by `category` on the `/Documentation` hub (Products, .NET Libraries, Engineering Standards, Corda) |
| `contributors` | `src/content/contributors/<slug>.md` | `/Contributors/<Name>` and the contributor cards on the home page |
| `technologies` | `src/content/technologies.yaml` | The technology logos on the home page (sorted by `id`) |
| `policies` | `src/content/policies/<slug>.md` | `/Legal/<Name>` policy pages, listed by `group` (Legal, Responsibility, Trust) on the `/Legal` hub and in the footer |

Site-wide settings (canonical host, social links, contact form endpoint, and the company's legal details, which `/Legal/Company-Information` uses) are in `src/config/site.ts`. Navigation is
in `src/config/navigation.ts`; documentation categories and their order in `src/config/documentation-categories.ts`.

Marketing copy that isn't product information (the home page, Consulting, Contact and the hero text on
Products and Aero) lives directly in the `.astro` files under `src/pages/`.

### Product fields that matter

- `path` is the public URL. **Never change an existing `path`**: the URLs are indexed and linked from elsewhere,
  and GitHub Pages can't issue server-side redirects.
- `summary` is the hero paragraph. `overview` is the card text on other pages; omit it to reuse `summary`.
- `hook` is the one-line pitch on cards.
- `description` is the meta description for search results: 50 to 170 characters, factual, no keyword stuffing.
- `sections[].features[].body`: separate paragraphs with a blank line.

## Keeping product content current

Each product's source of truth is its repository (`repositoryUrl`). When updating a product:

1. Read the repository's README, release notes or changelog, and public API changes since the content was last
   updated (`git log -- src/content/products/<file>` shows when that was).
2. Update the product's YAML: add, remove or reword `features` to match what the library actually ships, and update
   `summary`, `hook` and `description` when the headline capabilities change.
3. Don't invent claims. Every statement must be supported by the repository, its docs or its releases.
4. Keep the existing voice: confident, concrete, American English spelling ("modernize", "specialized").
5. Run the checks below, then open a pull request that lists the source for each change.

## Adding things

- **An article:** add `src/content/articles/<category>/<slug>.md` with the frontmatter the schema requires. The
  `path` must start with `/Documentation/`, and never changes once published, even if the article moves category. Give it
  a `published` date. Use `##` and deeper headings in the body; the title is rendered as the page's `<h1>`, and the `##`
  headings make its outline. A new category also needs an entry in `src/config/documentation-categories.ts` and the
  schema's `category` enum.
- **A product:** add a YAML file in `src/content/products/`, with an icon under `public/onixlabs/images/icons/`,
  then add its URL to `tests/e2e/support/site-pages.ts`.
- **A contributor:** add a Markdown file in `src/content/contributors/`, with an `accent` for their title, and a 640×640 photo under
  `public/onixlabs/images/contributors/`, then add the URL to `tests/e2e/support/site-pages.ts`.
- **An icon:** copy its SVG from `node_modules/@phosphor-icons/core/assets/duotone/` into `src/icons/`, dropping the
  `-duotone` suffix from the file name, and use `<Icon name="..." />` with the Phosphor name. Aero principles reference icons by name.
- **A glass icon:** export a light and a `-dark` WebP from Affinity, 640×640 with the high quality preset, into `public/onixlabs/images/icons/glass/`. `npm run images` leaves these alone; only `ai` is still
  rendered from its SVG.
- **A bitmap-backed SVG** (an SVG that embeds `data:image`): add it under `public/onixlabs/images/`, run
  `npm run images`, and reference the generated `.webp`.

## Legal and policy pages

The policies in `src/content/policies/` describe what ONIXLabs actually does, as audited on 8 November 2026: the site sets
no cookies, runs no analytics, and receives personal data only through the contact form (Formspree), email (Namecheap
Private Email) and Calendly. **If that changes, update the policies in the same change:** adding analytics or any
non-essential cookie or storage needs consent before it's set, a consent control, and new Cookie and Privacy Policy
text. Never add a commitment, certification or practice to a policy that hasn't been confirmed by the director. Update
`updated` in a policy's frontmatter whenever its text changes, and `Expires` in `public/.well-known/security.txt` before
it lapses. These pages aren't legal advice; changes of substance should be checked by a qualified UK adviser.

## Checks to run before every pull request

```sh
npm run lint
npm test
npm run build
npm run test:e2e
```

CI runs the same checks plus Lighthouse. Fix failures; never skip or weaken a test to get green.

## Rules

- **SEO:** every page needs one `<h1>`, a unique title and a meta description. `BaseLayout` takes these as props
  and emits the canonical URL, Open Graph tags and JSON-LD.
- **Accessibility:** give every image meaningful `alt` text, or `alt=""` if it's decorative. Links that open a new
  tab must say so (`(opens in a new tab)` in visually hidden text), and icon-only links need visually hidden text.
  Keep text contrast at WCAG AA (4.5:1). The axe tests run in both themes.
- **CSP:** Astro hashes every inline script and style into a `<meta>` Content Security Policy. Don't add inline
  `style="..."` attributes or event handlers (set CSS variables from scripts with `style.setProperty` instead), and
  don't load third-party scripts, fonts or images without updating the policy in `astro.config.ts`.
- **TypeScript:** follow the house style that `eslint.config.js` enforces: explicit types, no `any`, one exported
  type per file, named exports.
