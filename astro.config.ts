import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import sitemap from '@astrojs/sitemap';
import rehypeExternalLinks from 'rehype-external-links';

import { site } from './src/config/site';
import { rehypeBootstrapTables } from './src/markdown/rehype-bootstrap-tables';

// URLs keep the PascalCase, extension-less paths of the Blazor site (e.g. /Products/DotNet/Core).
// `build.format: 'file'` emits /Products/DotNet/Core.html, which GitHub Pages serves at the extension-less path
// without a trailing-slash redirect, so the canonical URL and the served URL are the same.
export default defineConfig({
    site: site.url,
    output: 'static',
    trailingSlash: 'never',
    build: {
        format: 'file',
    },
    integrations: [
        sitemap({
            filter: (page: string): boolean => !page.endsWith('/404'),
        }),
    ],
    markdown: {
        // Shiki emits inline styles, which the hash-based CSP below would block. The Blazor site had no
        // highlighting either, so code blocks render as plain <pre><code>.
        syntaxHighlight: false,
        processor: unified({
            rehypePlugins: [
                rehypeBootstrapTables,
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
