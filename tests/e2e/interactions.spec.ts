import type { Locator } from '@playwright/test';

import type { TestArguments } from './support/test-arguments';
import { expect, test } from './support/test';

test('the theme switch toggles dark mode and is keyboard operable', async ({ page }: TestArguments): Promise<void> => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html: Locator = page.locator('html');
    const toggle: Locator = page.getByRole('switch', { name: 'Dark mode' });

    await expect(html).toHaveAttribute('data-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await toggle.focus();
    await page.keyboard.press('Enter');

    await expect(html).toHaveAttribute('data-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    await page.goto('/Products');

    await expect(html).toHaveAttribute('data-theme', 'dark');
});

test('the skip link moves focus to the main content', async ({ page, isMobile }: TestArguments): Promise<void> => {
    test.skip(isMobile, 'Keyboard navigation is a desktop concern.');
    await page.goto('/Products');

    await page.keyboard.press('Tab');
    const skipLink: Locator = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page.locator('main')).toBeFocused();
});

test('the mobile menu opens and closes', async ({ page, isMobile }: TestArguments): Promise<void> => {
    test.skip(!isMobile, 'The menu is only collapsed on small screens.');
    await page.goto('/');
    const toggler: Locator = page.getByRole('button', { name: 'Toggle navigation' });
    const documentation: Locator = page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Documentation' });

    await expect(page.getByRole('navigation', { name: 'Main' })).toBeHidden();
    await expect(documentation).toBeHidden();
    await toggler.click();

    await expect(documentation).toBeVisible();
    await page.keyboard.press('Escape');

    await expect(documentation).toBeHidden();
});

test('the current page is marked in the navigation', async ({ page, isMobile }: TestArguments): Promise<void> => {
    test.skip(isMobile, 'Covered on desktop.');
    await page.goto('/Products/Kotlin/Core');

    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Products' })).toHaveAttribute('aria-current', 'page');
});

test('the contact form is prefilled from ?reason=', async ({ page }: TestArguments): Promise<void> => {
    await page.goto('/Contact?reason=aero-demo');

    await expect(page.getByLabel('Reason', { exact: true })).toHaveValue('ONIXLabs Aero');
    await expect(page.getByLabel('Message', { exact: true })).toHaveValue("Hello. I'd like to see Aero in action.");
});

test('the contact form posts to Formspree', async ({ page }: TestArguments): Promise<void> => {
    await page.goto('/Contact');

    await expect(page.locator('form')).toHaveAttribute('action', 'https://formspree.io/f/xwpqpeay');
    await expect(page.locator('form')).toHaveAttribute('method', 'post');
});

test('an article in a series offers its next part first', async ({ page }: TestArguments): Promise<void> => {
    await page.goto('/Documentation/Corda/Flow-Design-Guidelines-2');
    const keepReading: Locator = page.getByRole('region', { name: 'More from Corda' });

    await expect(keepReading.getByRole('listitem').first().getByRole('link')).toHaveAttribute('href', '/Documentation/Corda/Flow-Design-Guidelines-3');
    await expect(page.getByRole('link', { name: 'Corda', exact: true })).toHaveAttribute('href', '/Documentation/#corda');
});
