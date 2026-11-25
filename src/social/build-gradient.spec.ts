import { describe, expect, it } from 'vitest';

import { buildGradient } from './build-gradient';

describe('buildGradient', (): void => {
    it('runs through the colours from left to right', (): void => {
        expect(buildGradient(['violet', 'blue'])).toBe('linear-gradient(90deg, #A166AB, #5073B8)');
    });
});
