import { describe, expect, it } from 'vitest';

import { detectPlatform } from './detect-platform';

describe('detectPlatform', (): void => {
    it('recognizes the desktop platforms', (): void => {
        expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15', 0)).toBe('macos');
        expect(detectPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/130.0 Safari/537.36', 0)).toBe('windows');
        expect(detectPlatform('Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/132.0', 0)).toBe('linux');
    });

    it('ignores phones, tablets and ChromeOS', (): void => {
        expect(detectPlatform('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15', 5)).toBeUndefined();
        expect(detectPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Safari/604.1', 5)).toBeUndefined();
        expect(detectPlatform('Mozilla/5.0 (Linux; Android 15; Pixel 9) Chrome/130.0 Mobile Safari/537.36', 5)).toBeUndefined();
        expect(detectPlatform('Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) Chrome/130.0 Safari/537.36', 0)).toBeUndefined();
    });
});
