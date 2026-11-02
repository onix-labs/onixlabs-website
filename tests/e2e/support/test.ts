import { test as base } from '@playwright/test';
import type { BrowserContext } from '@playwright/test';

import { serveDist } from './serve-dist';

export const test: typeof base = base.extend({
    context: async ({ context }: { readonly context: BrowserContext }, use: (context: BrowserContext) => Promise<void>): Promise<void> => {
        await serveDist(context);
        await use(context);
    },
});

export { expect } from '@playwright/test';
