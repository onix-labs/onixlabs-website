import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { studioColours } from './config/studio-colours';

// These schemas are the contract for all site content. Content that doesn't match fails `astro build`,
// so an invalid edit can't reach production. See CLAUDE.md for how each collection is used.

const sitePath: z.ZodString = z.string().regex(/^\/[A-Za-z0-9/-]*$/, 'Must be a site-relative path such as /Products/DotNet/Core');
const publicImage: z.ZodString = z.string().regex(/^\/onixlabs\/images\/.+\.(svg|png|jpe?g|webp|avif)$/, 'Must be a path under /onixlabs/images/');
const metaDescription: z.ZodString = z.string().min(50).max(170);

const productFamilies = defineCollection({
    loader: file('src/content/product-families.yaml'),
    schema: z.object({
        name: z.string(),
        order: z.number().int(),
        logo: z.string().min(1),
        tilePath: z.string().startsWith('/Products/'),
        callout: z.string(),
        capabilitiesCallout: z.string(),
        packageRegistry: z.object({
            name: z.string(),
            programmingLanguage: z.string(),
        }),
    }),
});

const products = defineCollection({
    loader: glob({ pattern: '*.yaml', base: 'src/content/products' }),
    schema: z.object({
        family: reference('productFamilies'),
        order: z.number().int(),
        path: sitePath.startsWith('/Products/'),
        title: z.string(),
        shortTitle: z.string(),
        pageTitle: z.string(),
        description: metaDescription,
        callout: z.string(),
        // The hero's standfirst: one short statement of what it is and why it matters.
        lead: z.string(),
        // The product's outline emblem, for structured data and the sibling tiles of families without glass icons.
        icon: publicImage,
        // The description in the page's structured data.
        summary: z.string(),
        repositoryUrl: z.url(),
        packagesUrl: z.url(),
        sections: z.array(z.object({
            heading: z.string().optional(),
            paragraphs: z.array(z.string()).default([]),
            bullets: z.array(z.string()).default([]),
            closingParagraphs: z.array(z.string()).default([]),
            features: z.array(z.object({
                title: z.string(),
                // Separate paragraphs with a blank line.
                body: z.string(),
            })).default([]),
        })).min(1),
    }),
});

const articles = defineCollection({
    loader: glob({ pattern: '**/*.md', base: 'src/content/articles' }),
    schema: z.object({
        title: z.string(),
        description: metaDescription,
        category: z.enum(['products', 'dotnet', 'standards', 'corda']),
        order: z.number().int(),
        path: sitePath.startsWith('/Documentation/'),
        author: reference('contributors').optional(),
        published: z.coerce.date().optional(),
        updated: z.coerce.date().optional(),
    }),
});

const contributors = defineCollection({
    loader: glob({ pattern: '*.md', base: 'src/content/contributors' }),
    schema: z.object({
        name: z.string(),
        givenName: z.string(),
        familyName: z.string(),
        order: z.number().int(),
        path: sitePath.startsWith('/Contributors/'),
        jobTitle: z.string(),
        accent: z.enum(['blue', 'rose', 'coral', 'teal']),
        teaser: z.string(),
        description: metaDescription,
        photo: publicImage,
        linkedInUrl: z.url(),
        gitHubUrl: z.url(),
    }),
});

const technologies = defineCollection({
    loader: file('src/content/technologies.yaml'),
    schema: z.object({
        title: z.string(),
        image: publicImage,
        url: z.url(),
    }),
});

// A single entry (`aero`) holding the Aero page's principles and architecture modules.
const aero = defineCollection({
    loader: file('src/content/aero.yaml'),
    schema: z.object({
        principles: z.array(z.object({
            title: z.string(),
            // A glass icon in public/onixlabs/images/icons/glass.
            glass: z.string(),
            body: z.string(),
        })).min(1),
        architecture: z.array(z.object({
            title: z.string(),
            body: z.string(),
        })).min(1),
    }),
});

// A single entry (`studio`) holding the Studio page's features, one for each screenshot, and the capabilities around them.
const studio = defineCollection({
    loader: file('src/content/studio.yaml'),
    schema: z.object({
        features: z.array(z.object({
            // The section's anchor on the page.
            id: z.string().regex(/^[a-z-]+$/),
            // The id of a screen in src/config/studio-screens.ts.
            screen: z.string(),
            label: z.string(),
            // Its label's colour, its highlight's gradient, and its window's glow, from top left to bottom right.
            colours: z.object({
                label: z.enum(studioColours),
                highlight: z.tuple([z.enum(studioColours), z.enum(studioColours)]),
                glow: z.tuple([z.enum(studioColours), z.enum(studioColours)]),
            }),
            title: z.string(),
            highlight: z.string(),
            lead: z.string(),
            points: z.array(z.object({
                title: z.string(),
                body: z.string(),
            })).min(1).max(4),
        })).min(1),
        extras: z.array(z.object({
            title: z.string(),
            // The name of an SVG in src/icons.
            icon: z.string(),
            body: z.string(),
        })).min(1),
    }),
});

// The root page for a family of libraries, keyed by the family's id, with its packages and how to get them.
const libraryPages = defineCollection({
    loader: file('src/content/library-pages.yaml'),
    schema: z.object({
        family: reference('productFamilies'),
        path: z.string().regex(/^\/Products\/[A-Za-z]+$/),
        pageTitle: z.string(),
        description: z.string().min(50).max(170),
        title: z.string(),
        highlight: z.string(),
        lead: z.string(),
        repositoryUrl: z.url(),
        docsUrl: z.url(),
        packagesUrl: z.url(),
        packageRegistry: z.string(),
        // The headline's gradient, from the family's colours.
        colours: z.tuple([z.enum(studioColours), z.enum(studioColours)]),
        // Where each package is published; {package} stands for its name.
        packageUrl: z.string().includes('{package}'),
        packages: z.array(z.object({
            name: z.string(),
            // The glass icon beside its section, in public/onixlabs/images/icons/glass.
            glass: z.string(),
            // Its section's two-part headline.
            title: z.string(),
            highlight: z.string(),
            // A short standfirst, then two paragraphs: the problem, then how and why the package solves it.
            summary: z.string(),
            details: z.tuple([z.string(), z.string()]),
            // The product page that covers it, when there is one.
            pagePath: z.string().startsWith('/Products/').optional(),
            // Its page in the wiki at docsUrl, or a documentation URL of its own for a package with its own repository.
            docsPage: z.string().optional(),
            docsUrl: z.url().optional(),
            // Its registry listing, when it isn't the single package packageUrl points at.
            registryUrl: z.url().optional(),
        })).min(1),
    }),
});

// Legal, responsibility and trust policies, at /Legal/<Name>, listed on the /Legal hub and in the footer by `group`.
const policies = defineCollection({
    loader: glob({ pattern: '*.md', base: 'src/content/policies' }),
    schema: z.object({
        title: z.string(),
        // Its name in the footer and on the hub, when shorter than the title.
        shortTitle: z.string().optional(),
        description: metaDescription,
        group: z.enum(['legal', 'responsibility', 'trust']),
        order: z.number().int(),
        path: sitePath.startsWith('/Legal/'),
        effective: z.coerce.date(),
        updated: z.coerce.date(),
    }),
});

export const collections = { productFamilies, products, articles, contributors, technologies, aero, studio, libraryPages, policies };
