import { defineConfig, devices } from '@playwright/test';

// The suite serves dist/ through request interception (tests/e2e/support/serve-dist.ts), resolving paths the
// way GitHub Pages does, so it needs a prior `npm run build` but no local web server.
export default defineConfig({
    testDir: 'tests/e2e',
    fullyParallel: true,
    forbidOnly: process.env['CI'] !== undefined,
    retries: process.env['CI'] !== undefined ? 1 : 0,
    reporter: process.env['CI'] !== undefined ? 'github' : 'list',
    use: {
        baseURL: 'https://www.onixlabs.io',
    },
    projects: [
        { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
        { name: 'mobile', use: { ...devices['Pixel 7'] } },
    ],
});
