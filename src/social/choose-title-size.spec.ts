import { describe, expect, it } from 'vitest';

import { chooseTitleSize } from './choose-title-size';

describe('chooseTitleSize', (): void => {
    it('sets a short headline larger than a long one', (): void => {
        const short: number = chooseTitleSize('Understanding Monads');
        const medium: number = chooseTitleSize('Equality and Value Semantics');
        const long: number = chooseTitleSize('Billion-Dollar Mistakes and Functional Fixes');

        expect(short).toBeGreaterThan(medium);
        expect(medium).toBeGreaterThan(long);
    });
});
