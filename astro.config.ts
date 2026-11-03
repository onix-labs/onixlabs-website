import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import type { SitemapItem } from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';

import { site } from './src/config/site';
import { toCanonicalPath } from './src/config/to-canonical-path';
import { emitSectionIndexes } from './src/integrations/emit-section-indexes';
import { rehypeBootstrapTables } from './src/markdown/rehype-bootstrap-tables';
import { rehypeFocusableCodeBlocks } from './src/markdown/rehype-focusable-code-blocks';

// URLs keep the PascalCase, extension-less paths of the Blazor site (e.g. /Products/DotNet/Core).
// `build.format: 'file'` emits /Products/DotNet/Core.html, which GitHub Pages serves at the extension-less path
// without a trailing-slash redirect, so the canonical URL and the served URL are the same.
export default defineConfig({
    site: site.url,
    output: 'static',
    trailingSlash: 'ignore',
    build: {
        format: 'file',
    },
    vite: {
        build: {
            // Vite inlines small assets (including some font subsets) as data: URIs, which font-src 'self' blocks.
            assetsInlineLimit: 0,
        },
    },
    integrations: [
        sitemap({
            // The blank canvas at / is noindex while it's empty, so it stays out of the sitemap too.
            filter: (page: string): boolean => !page.endsWith('/404') && new URL(page).pathname !== '/',
            serialize: (item: SitemapItem): SitemapItem => ({ ...item, url: new URL(toCanonicalPath(new URL(item.url).pathname), site.url).href }),
        }),
        emitSectionIndexes(),
    ],
    markdown: {
        // Shiki emits inline styles, which the hash-based CSP below would block. The Blazor site had no
        // highlighting either, so code blocks render as plain <pre><code>.
        syntaxHighlight: false,
        processor: unified({
            rehypePlugins: [
                rehypeBootstrapTables,
                rehypeFocusableCodeBlocks,
                [rehypeExternalLinks, {
                    target: '_blank',
                    rel: ['noopener', 'noreferrer'],
                    content: {
                        type: 'element',
                        tagName: 'span',
                        properties: { className: ['visually-hidden'] },
                        children: [{ type: 'text', value: ' (opens in a new tab)' }],
                    },
                }],
            ],
        }),
    },
    security: {
        csp: {
            // Astro adds hashed script-src and style-src directives for every script and style it emits.
            // frame-ancestors can't be set from a <meta> tag; GitHub Pages can't send headers (see MIGRATION.md).
            directives: [
                "default-src 'self'",
                "img-src 'self' data:",
                "font-src 'self'",
                "connect-src 'self'",
                "form-action https://formspree.io",
                "base-uri 'self'",
                "object-src 'none'",
                "frame-src 'none'",
                'upgrade-insecure-requests',
            ],
        },
    },
});
