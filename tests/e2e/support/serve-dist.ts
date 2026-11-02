import { readFile } from 'node:fs/promises';

import type { BrowserContext, Route } from '@playwright/test';

import { contentTypeFor } from './content-type-for';
import { resolveDistFile } from './resolve-dist-file';
import type { ResolvedFile } from './resolved-file';

const siteOrigin: string = 'https://www.onixlabs.io';

// Requests to the site are answered from dist/; anything else is aborted, so a page that depends on a
// third-party origin fails the test instead of silently reaching the network.
export async function serveDist(context: BrowserContext): Promise<void> {
    await context.route('**/*', async (route: Route): Promise<void> => {
        const url: URL = new URL(route.request().url());

        if (url.origin !== siteOrigin) {
            await route.abort('blockedbyclient');
            return;
        }

        const file: ResolvedFile = await resolveDistFile(url.pathname);
        const body: Buffer = await readFile(file.filePath);
        await route.fulfill({ status: file.status, body, contentType: contentTypeFor(file.filePath) });
    });
}
