import { describe, expect, it } from 'vitest';

import { formatPageTitle } from './format-page-title';

describe('formatPageTitle', (): void => {
    it('puts the page name before the site name', (): void => {
        const title: string = formatPageTitle('Contact', 'ONIXLabs');

        expect(title).toBe('Contact | ONIXLabs');
    });

    it('leaves a title that already starts with the site name unchanged', (): void => {
        const title: string = formatPageTitle('ONIXLabs | Enterprise Software Engineering', 'ONIXLabs');

        expect(title).toBe('ONIXLabs | Enterprise Software Engineering');
    });

    it('does not repeat the site name when the title is the site name', (): void => {
        const title: string = formatPageTitle('ONIXLabs', 'ONIXLabs');

        expect(title).toBe('ONIXLabs');
    });
});
