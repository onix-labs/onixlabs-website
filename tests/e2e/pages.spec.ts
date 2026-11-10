import type { BrowserContext, ConsoleMessage, Page, Response } from '@playwright/test';

import { sectionPaths } from '../../src/config/section-paths';
import { toCanonicalPath } from '../../src/config/to-canonical-path';
import { serveDist } from './support/serve-dist';
import { sitePages } from './support/site-pages';
import type { SitePage } from './support/site-page';
import type { TestArguments } from './support/test-arguments';
import { expect, test } from './support/test';

// WebKit checks the stylesheet it applies to its own <select> picker against the page's Content Security Policy and
// logs a refusal, on every page with a select, with no effect on the control. It's WebKit's bug, not a policy problem.
function isWebKitSelectStylesheetNoise(text: string): boolean {
    return text.startsWith('Refused to apply a stylesheet because its hash, its nonce, or \'unsafe-inline\' does not appear in the style-src');
}

for (const sitePage of sitePages) {
    test.describe(sitePage.path, (): void => {
        test('serves the full content without JavaScript errors or CSP violations', async ({ page }: TestArguments): Promise<void> => {
            const problems: string[] = [];
            page.on('console', (message: ConsoleMessage): void => {
                if (message.type() === 'error' && !isWebKitSelectStylesheetNoise(message.text())) {
                    problems.push(message.text());
                }
            });
            page.on('pageerror', (error: Error): void => {
                problems.push(error.message);
            });

            const response: Response | null = await page.goto(sitePage.path);

            expect(response?.status()).toBe(200);
            await expect(page).toHaveTitle(sitePage.title);
            await expect(page.locator('h1')).toHaveCount(1);
            await expect(page.locator('main')).not.toBeEmpty();
            expect(problems).toEqual([]);
        });

        test('declares canonical, description and social metadata', async ({ page }: TestArguments): Promise<void> => {
            await page.goto(sitePage.path);

            const expectedUrl: string = `https://www.onixlabs.io${toCanonicalPath(sitePage.path)}`;
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', expectedUrl);
            await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', expectedUrl);
            await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
            await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /^https:\/\/www\.onixlabs\.io\//);
            await expect(page.locator('meta[http-equiv="content-security-policy"]')).toHaveCount(1);

            const structuredData: string | null = await page.locator('script[type="application/ld+json"]').textContent();
            expect((): unknown => JSON.parse(structuredData ?? '')).not.toThrow();
        });

        test('renders its content in the HTML without running JavaScript', async ({ browser }: TestArguments): Promise<void> => {
            const context: BrowserContext = await browser.newContext({ javaScriptEnabled: false });
            await serveDist(context);
            const page: Page = await context.newPage();

            await page.goto(sitePage.path);

            await expect(page.locator('h1')).toBeVisible();
            const text: string = await page.locator('main').innerText();
            expect(text.split(/\s+/).length).toBeGreaterThan(25);
            await context.close();
        });
    });
}

test('unknown URLs get the 404 page, marked noindex', async ({ page }: TestArguments): Promise<void> => {
    const response: Response | null = await page.goto('/Tools/Hash-Generator');

    expect(response?.status()).toBe(404);
    await expect(page.locator('h1')).toContainText('Yikes!');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
});

test('every internal link points at a page that exists', async ({ page }: TestArguments): Promise<void> => {
    const paths: Set<string> = new Set<string>();

    for (const sitePage of sitePages) {
        await page.goto(sitePage.path);
        const hrefs: string[] = await page.locator('a[href^="/"]').evaluateAll(
            (anchors: Element[]): string[] => anchors.map((anchor: Element): string => anchor.getAttribute('href') ?? ''),
        );
        for (const href of hrefs) {
            paths.add(new URL(href, 'https://www.onixlabs.io').pathname.replace(/(.)\/$/, '$1'));
        }
    }

    const knownPaths: Set<string> = new Set<string>(sitePages.map((sitePage: SitePage): string => sitePage.path));
    const unknown: string[] = [...paths].filter((linkPath: string): boolean => !knownPaths.has(linkPath));
    expect(unknown).toEqual([]);
});

for (const sectionPath of sectionPaths) {
    test(`${sectionPath} resolves with and without a trailing slash`, async ({ page }: TestArguments): Promise<void> => {
        for (const url of [sectionPath, `${sectionPath}/`]) {
            const response: Response | null = await page.goto(url);

            expect(response?.status()).toBe(200);
            await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://www.onixlabs.io${sectionPath}/`);
        }
    });
}
