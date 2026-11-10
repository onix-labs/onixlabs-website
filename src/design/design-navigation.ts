import type { DesignGroup } from './design-group';

// The design language's table of contents. Each slug maps to src/design/pages/<slug>.astro and is served at
// /design/<slug> by the dev server only. The foundations and components follow the Stride design system.
export const designNavigation: ReadonlyArray<DesignGroup> = [
    {
        title: 'Foundations',
        pages: [
            { slug: 'stride', title: 'From Stride', summary: 'How the Stride design system maps onto the website, and where it was adjusted.' },
            { slug: 'colour', title: 'Colour', summary: 'Surfaces and edges, semantic intents, the brand stops and product colours.' },
            { slug: 'typography', title: 'Typography', summary: 'Poppins, the type scale, headline styles, standfirsts and labels.' },
            { slug: 'layout', title: 'Layout and spacing', summary: 'Containers, the grid, bands and the spacing scale.' },
            { slug: 'shape', title: 'Shape and elevation', summary: 'Squircle radii, edges and shadows.' },
            { slug: 'iconography', title: 'Iconography', summary: 'Line icons, glass icons and product emblems.' },
            { slug: 'motion', title: 'Motion', summary: 'Transitions, entrances, scroll-driven reveals and reduced motion.' },
        ],
    },
    {
        title: 'Atoms',
        pages: [
            { slug: 'buttons', title: 'Buttons', summary: 'Primary, secondary, danger and spectral buttons, sizes and icons.' },
            { slug: 'button-groups', title: 'Button groups', summary: 'Related buttons joined into one control.' },
            { slug: 'links', title: 'Links', summary: 'Inline links and link-style calls to action.' },
            { slug: 'labels', title: 'Labels and badges', summary: 'Technical labels, badges and the announcement pill.' },
            { slug: 'chips', title: 'Chips', summary: 'Compact, optionally removable tags.' },
            { slug: 'avatars', title: 'Avatars', summary: 'People as photos or initials, in sizes and groups.' },
            { slug: 'dividers', title: 'Dividers', summary: 'Rules that separate content, with or without a label.' },
        ],
    },
    {
        title: 'Forms',
        pages: [
            { slug: 'forms', title: 'Text fields', summary: 'Inputs, selects, text areas, help text and their states.' },
            { slug: 'choices', title: 'Choices', summary: 'Checkboxes, radio groups and switches.' },
            { slug: 'ranges', title: 'Range and number', summary: 'Sliders and numeric steppers.' },
            { slug: 'file-input', title: 'File input', summary: 'Choosing files to upload.' },
            { slug: 'input-groups', title: 'Input groups and floating labels', summary: 'Fields with attached text or buttons, and labels that float.' },
        ],
    },
    {
        title: 'Components',
        pages: [
            { slug: 'cards', title: 'Cards', summary: 'The raised Stride card with header, body and footer.' },
            { slug: 'alerts', title: 'Alerts', summary: 'Inline messages in each semantic intent.' },
            { slug: 'accordion', title: 'Accordion', summary: 'Collapsible sections, natively exclusive.' },
            { slug: 'tabs', title: 'Tabs', summary: 'Switching between related panels.' },
            { slug: 'tables', title: 'Tables', summary: 'Tabular data.' },
            { slug: 'data-display', title: 'Stats and description lists', summary: 'Key figures and term–definition pairs.' },
            { slug: 'breadcrumbs', title: 'Breadcrumbs and pagination', summary: 'Where you are, and moving between pages.' },
            { slug: 'overlays', title: 'Tooltips, toasts and modals', summary: 'Content that appears above the page.' },
            { slug: 'section-headers', title: 'Section headers', summary: 'Label, headline and standfirst at the top of a section.' },
            { slug: 'heroes', title: 'Heroes', summary: 'The opening of a page: the library hero in family colours or the full spectrum.' },
            { slug: 'tiles', title: 'Tiles', summary: 'Family, product and team tiles.' },
            { slug: 'studio-feature', title: 'Studio features', summary: 'The staggered feature bands: a screenshot beside the points that explain it.' },
            { slug: 'bands', title: 'Bands', summary: 'Full-width sections in the page, alt and dark tones.' },
            { slug: 'marquee', title: 'Marquee', summary: 'The scrolling technology strip.' },
            { slug: 'calls-to-action', title: 'Calls to action', summary: 'The closing call-to-action band.' },
            { slug: 'navigation', title: 'Header and footer', summary: 'The site header, its scroll progress, and the directory footer.' },
        ],
    },
];
