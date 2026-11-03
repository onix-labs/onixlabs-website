import { describe, expect, it } from 'vitest';

import { estimateReadingMinutes } from './estimate-reading-minutes';

describe('estimateReadingMinutes', (): void => {
    it('rounds to the nearest minute at 220 words per minute', (): void => {
        const minutes: number = estimateReadingMinutes('word '.repeat(660));

        expect(minutes).toBe(3);
    });

    it('never estimates less than one minute', (): void => {
        const minutes: number = estimateReadingMinutes('Short.');

        expect(minutes).toBe(1);
    });
});
