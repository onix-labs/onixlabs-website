import type { Locator } from '@playwright/test';

import { expect, test } from './support/test';

test('the theme switch toggles dark mode and is keyboard operable', async ({ page, isMobile }): Promise<void> => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const html: Locator = page.locator('html');
    const toggle: Locator = page.getByRole('switch', { name: 'Dark mode' });

    if (isMobile) {
        await page.getByRole('button', { name: 'Toggle navigation' }).click();
    }

    await expect(html).toHaveAttribute('data-bs-theme', 'light');
    await expect(toggle).toHaveAttribute('aria-checked', 'false');

    await toggle.focus();
    await page.keyboard.press('Enter');

    await expect(html).toHaveAttribute('data-bs-theme', 'dark');
    await expect(toggle).toHaveAttribute('aria-checked', 'true');

    await page.goto('/Products');

    await expect(html).toHaveAttribute('data-bs-theme', 'dark');
});

test('the skip link moves focus to the main content', async ({ page, isMobile }): Promise<void> => {
    test.skip(isMobile, 'Keyboard navigation is a desktop concern.');
    await page.goto('/Products');

    await page.keyboard.press('Tab');
    const skipLink: Locator = page.getByRole('link', { name: 'Skip to main content' });
    await expect(skipLink).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(page.locator('main')).toBeFocused();
});

test('the mobile menu opens and closes', async ({ page, isMobile }): Promise<void> => {
    test.skip(!isMobile, 'The menu is only collapsed on small screens.');
    await page.goto('/');
    const toggler: Locator = page.getByRole('button', { name: 'Toggle navigation' });
    const documentation: Locator = page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Documentation' });

    await expect(documentation).toBeHidden();
    await toggler.click();

    await expect(toggler).toHaveAttribute('aria-expanded', 'true');
    await expect(documentation).toBeVisible();
});

test('the current page is marked in the navigation', async ({ page, isMobile }): Promise<void> => {
    test.skip(isMobile, 'Covered on desktop.');
    await page.goto('/Products/Kotlin/Core');

    await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Products' })).toHaveAttribute('aria-current', 'page');
});

test('the contact form is prefilled from ?reason=', async ({ page }): Promise<void> => {
    await page.goto('/Contact?reason=aero-demo');

    await expect(page.getByLabel('Reason')).toHaveValue('Aero Platform (Book a Demo)');
    await expect(page.getByLabel('Message')).toHaveValue("Hello. I'd like to see Aero in action.");
});

test('the contact form posts to Formspree', async ({ page }): Promise<void> => {
    await page.goto('/Contact');

    await expect(page.locator('form')).toHaveAttribute('action', 'https://formspree.io/f/xwpqpeay');
    await expect(page.locator('form')).toHaveAttribute('method', 'post');
});

test('the documentation sidebar opens the current article\'s category', async ({ page }): Promise<void> => {
    await page.goto('/Documentation/Corda/Flow-Design-Guidelines-2');
    const sidebar: Locator = page.getByRole('navigation', { name: 'Documentation' });

    await expect(sidebar.getByRole('button', { name: 'Corda' })).toHaveAttribute('aria-expanded', 'true');
    await expect(sidebar.getByRole('link', { name: 'Flow Design Guidelines (Part 2)' })).toHaveAttribute('aria-current', 'page');
});
