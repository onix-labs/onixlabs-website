import AxeBuilder from '@axe-core/playwright';
import type { AxeResults, Result } from 'axe-core';

import { sitePages } from './support/site-pages';
import type { TestArguments } from './support/test-arguments';
import { expect, test } from './support/test';

const themes: ReadonlyArray<'light' | 'dark'> = ['light', 'dark'];

function describeViolation(violation: Result): string {
    const targets: string = violation.nodes.slice(0, 3).map((node: Result['nodes'][number]): string => node.target.join(' ')).join(', ');
    return `${violation.id} (${violation.impact ?? 'unknown'}): ${violation.help} — ${targets}`;
}

for (const theme of themes) {
    test.describe(`${theme} theme`, (): void => {
        test.use({ colorScheme: theme });

        for (const sitePage of sitePages) {
            test(`${sitePage.path} has no WCAG 2.2 AA violations`, async ({ page }: TestArguments): Promise<void> => {
                await page.emulateMedia({ reducedMotion: 'reduce' });
                await page.goto(sitePage.path);
                await expect(page.locator('html')).toHaveAttribute('data-bs-theme', theme);

                const results: AxeResults = await new AxeBuilder({ page })
                    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
                    .analyze();

                expect(results.violations.map(describeViolation)).toEqual([]);
            });
        }
    });
}
