import { defineCollection, reference } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

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
        headline: z.string(),
        callout: z.string(),
        introduction: z.string(),
        capabilitiesCallout: z.string(),
        otherProductsHeadline: z.string(),
        backgroundClass: z.enum(['bg-dotnet', 'bg-corda', 'bg-kotlin']),
        heroBackgroundClass: z.enum(['bg-dotnet-fade', 'bg-corda-fade', 'bg-kotlin-fade']),
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
        icon: publicImage,
        iconAlt: z.string().min(1),
        summary: z.string(),
        hook: z.string(),
        // Card text on the Products index and sibling product pages; falls back to `summary` when omitted.
        overview: z.string().optional(),
        repositoryUrl: z.url(),
        packagesUrl: z.url(),
        packagesLabel: z.string(),
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
        navigationTitle: z.string(),
        description: metaDescription,
        category: z.enum(['aero', 'csharp', 'corda', 'number-theory']),
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
        headline: z.string(),
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
            // The name of an SVG in src/icons.
            icon: z.string(),
            body: z.string(),
        })).min(1),
        architecture: z.array(z.object({
            title: z.string(),
            body: z.string(),
        })).min(1),
    }),
});

export const collections = { productFamilies, products, articles, contributors, technologies, aero };
