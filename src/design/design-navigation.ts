import type { DesignGroup } from './design-group';

// The design language's table of contents. Each slug maps to src/design/pages/<slug>.astro and is served at
// /design/<slug> by the dev server only.
export const designNavigation: ReadonlyArray<DesignGroup> = [
    {
        title: 'Foundations',
        pages: [
            { slug: 'colour', title: 'Colour', summary: 'The brand stops, neutrals for light and dark, product colours and gradients.' },
            { slug: 'typography', title: 'Typography', summary: 'Typefaces, the type scale, headline styles, standfirsts and labels.' },
            { slug: 'layout', title: 'Layout and spacing', summary: 'Containers, the grid, bands and the spacing scale.' },
            { slug: 'shape', title: 'Shape and elevation', summary: 'Corner radii, borders and shadows.' },
            { slug: 'iconography', title: 'Iconography', summary: 'Line icons, glass icons and product emblems.' },
            { slug: 'motion', title: 'Motion', summary: 'Entrances, scroll-driven reveals, ambient light and reduced motion.' },
        ],
    },
    {
        title: 'Atoms',
        pages: [
            { slug: 'buttons', title: 'Buttons', summary: 'Primary, secondary and spectral pills, sizes and icons.' },
            { slug: 'links', title: 'Links', summary: 'Inline links and link-style calls to action.' },
            { slug: 'labels', title: 'Labels and badges', summary: 'Technical labels, badges and the announcement pill.' },
            { slug: 'forms', title: 'Form fields', summary: 'Inputs, selects, text areas and their states.' },
        ],
    },
    {
        title: 'Components',
        pages: [
            { slug: 'section-headers', title: 'Section headers', summary: 'Label, headline and standfirst at the top of a section.' },
            { slug: 'heroes', title: 'Heroes', summary: 'The opening of a page: capstone, family and simple heroes.' },
            { slug: 'tiles', title: 'Tiles', summary: 'Feature, product, capstone, article and team tiles.' },
            { slug: 'bands', title: 'Bands', summary: 'Full-width sections in white, grey and near-black.' },
            { slug: 'marquee', title: 'Marquee', summary: 'The scrolling technology strip.' },
            { slug: 'calls-to-action', title: 'Calls to action', summary: 'The closing call-to-action band.' },
            { slug: 'navigation', title: 'Header and footer', summary: 'The site header, its scroll progress, and the directory footer.' },
        ],
    },
    {
        title: 'Examples',
        pages: [
            { slug: 'examples/home', title: 'Home page', summary: 'A home page assembled from the components above.' },
            { slug: 'examples/product', title: 'Product page', summary: 'A capstone product page.' },
            { slug: 'examples/article', title: 'Article', summary: 'A documentation or blog article.' },
        ],
    },
];
