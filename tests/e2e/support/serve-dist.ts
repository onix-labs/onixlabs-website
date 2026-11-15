import { readFile } from 'node:fs/promises';

import type { BrowserContext, Route } from '@playwright/test';

import { turnstileOrigin } from '../../../src/config/turnstile-origin';
import { contentTypeFor } from './content-type-for';
import { fakeTurnstile } from './fake-turnstile';
import { resolveDistFile } from './resolve-dist-file';
import type { ResolvedFile } from './resolved-file';

const siteOrigin: string = 'https://www.onixlabs.io';

// Requests to the site are answered from dist/, and Cloudflare Turnstile's script by a fake; anything else is aborted,
// so a page that depends on a third-party origin fails the test instead of silently reaching the network.
export async function serveDist(context: BrowserContext): Promise<void> {
    await context.route('**/*', async (route: Route): Promise<void> => {
        const url: URL = new URL(route.request().url());

        if (url.origin === turnstileOrigin && url.pathname === '/turnstile/v0/api.js') {
            await route.fulfill({ body: fakeTurnstile, contentType: 'text/javascript; charset=utf-8' });
            return;
        }

        if (url.origin !== siteOrigin) {
            await route.abort('blockedbyclient');
            return;
        }

        const file: ResolvedFile = await resolveDistFile(url.pathname);
        const body: Buffer = await readFile(file.filePath);
        await route.fulfill({ status: file.status, body, contentType: contentTypeFor(file.filePath) });
    });
}
