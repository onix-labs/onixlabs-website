import { readFile } from 'node:fs/promises';

import { describe, expect, it } from 'vitest';

import { brandPalette } from './brand-palette';

describe('brandPalette', (): void => {
    it.each(Object.entries(brandPalette))('has the same %s as tokens.css', async (name: string, colour: string): Promise<void> => {
        const tokens: string = await readFile('src/styles/tokens.css', 'utf8');

        expect(tokens).toContain(`--brand-${name}: ${colour};`);
    });
});
