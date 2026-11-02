import type { APIRoute } from 'astro';

import { site } from '../config/site';

export const GET: APIRoute = (): Response => new Response(
    ['User-agent: *', 'Allow: /', '', `Sitemap: ${site.url}/sitemap-index.xml`, ''].join('\n'),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
);
