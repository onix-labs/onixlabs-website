# CLAUDE.md

Guidance for agents (and people) working on the ONIXLabs website. Most changes here are content updates: keeping
product information current, adding articles, updating bios. Read this before editing.

## How the site is built

Astro 7, static output, deployed to GitHub Pages. Every page is rendered to HTML at build time; the only
client-side JavaScript is the theme switch, the navbar scroll effect, Bootstrap's collapse (mobile menu and docs
sidebar) and the contact-form prefill. Keep it that way: content must never depend on JavaScript to appear.

## Content model

All content lives in `src/content/` and is validated by the Zod schemas in `src/content.config.ts`. **The schema is
the contract.** If an edit doesn't match it, `npm run build` fails; fix the content, don't loosen the schema
without a reason.

| Collection | Files | Renders |
|---|---|---|
| `products` | `src/content/products/<family>-<name>.yaml` | `/Products/<Family>/<Name>`, its card on `/Products`, and the "other products" cards on sibling product pages |
| `productFamilies` | `src/content/product-families.yaml` | The .NET, Corda and Kotlin sections on `/Products` and the family-level copy on product pages |
| `aero` | `src/content/aero.yaml` | The principles and architecture modules on `/Products/Aero` |
| `articles` | `src/content/articles/<category>/<slug>.md` | `/Documentation/...` pages and the documentation sidebar |
| `contributors` | `src/content/contributors/<slug>.md` | `/Contributors/<Name>` and the contributor cards on the home page |
| `technologies` | `src/content/technologies.yaml` | The technology logos on the home page (sorted by `id`) |

Site-wide settings (canonical host, social links, contact form endpoint) are in `src/config/site.ts`. Navigation is
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
  `path` must start with `/Documentation/`. Use `##` and deeper headings in the body; the title is rendered as the
  page's `<h1>`. A new category also needs an entry in `src/config/documentation-categories.ts` and the schema's
  `category` enum.
- **A product:** add a YAML file in `src/content/products/`, with an icon under `public/onixlabs/images/icons/`,
  then add its URL to `tests/e2e/support/site-pages.ts`.
- **A contributor:** add a Markdown file in `src/content/contributors/` and a 640×640 photo under
  `public/onixlabs/images/contributors/`, then add the URL to `tests/e2e/support/site-pages.ts`.
- **An icon:** copy the SVG from Font Awesome Free into `src/icons/` and use `<Icon name="..." />`.
- **A bitmap-backed SVG** (an SVG that embeds `data:image`): add it under `public/onixlabs/images/`, run
  `npm run images`, and reference the generated `.webp`.

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
  `style="..."` attributes or event handlers, and don't load third-party scripts without updating the policy in
  `astro.config.ts`.
- **TypeScript:** follow the house style that `eslint.config.js` enforces: explicit types, no `any`, one exported
  type per file, named exports.
