import { describe, expect, it } from 'vitest';

import { formatArticleDate } from './format-article-date';

describe('formatArticleDate', (): void => {
    it('writes the date out in full', (): void => {
        expect(formatArticleDate(new Date('2022-03-12'))).toBe('March 12, 2022');
    });

    it('keeps the calendar day, whatever the time zone', (): void => {
        expect(formatArticleDate(new Date('2025-12-31'))).toBe('December 31, 2025');
    });
});
