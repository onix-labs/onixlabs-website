import { describe, expect, it } from 'vitest';

import { selectCurrentHeading } from './select-current-heading';

describe('selectCurrentHeading', (): void => {
    it('picks the last heading that has passed the line', (): void => {
        expect(selectCurrentHeading([-400, -20, 300, 900], 100, false)).toBe(1);
    });

    it('picks the first heading before any has passed the line', (): void => {
        expect(selectCurrentHeading([250, 900], 100, false)).toBe(0);
    });

    it('picks the last heading at the bottom of the page', (): void => {
        expect(selectCurrentHeading([-900, -300, 600], 100, true)).toBe(2);
    });

    it('picks nothing when there are no headings', (): void => {
        expect(selectCurrentHeading([], 100, false)).toBe(-1);
    });
});
