import { describe, expect, it } from 'vitest';

import { detectArchitecture } from './detect-architecture';

const macUserAgent: string = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Safari/605.1.15';

function reporting(architecture: string): { getHighEntropyValues: () => Promise<{ architecture: string }> } {
    return { getHighEntropyValues: async (): Promise<{ architecture: string }> => Promise.resolve({ architecture }) };
}

describe('detectArchitecture', (): void => {
    it('uses the architecture Chromium browsers report', async (): Promise<void> => {
        expect(await detectArchitecture({ userAgent: macUserAgent, userAgentData: reporting('arm') })).toBe('arm');
        expect(await detectArchitecture({ userAgent: macUserAgent, userAgentData: reporting('x86') })).toBe('x86');
    });

    it('doesn’t believe "Intel" in a Mac’s user agent', async (): Promise<void> => {
        expect(await detectArchitecture({ userAgent: macUserAgent })).toBeUndefined();
    });

    it('treats a refused hint as unknown', async (): Promise<void> => {
        const userAgentData: { getHighEntropyValues: () => Promise<never> } = { getHighEntropyValues: async (): Promise<never> => Promise.reject(new Error('NotAllowedError')) };

        expect(await detectArchitecture({ userAgent: macUserAgent, userAgentData })).toBeUndefined();
    });

    it('recognizes ARM from a Linux user agent', async (): Promise<void> => {
        expect(await detectArchitecture({ userAgent: 'Mozilla/5.0 (X11; Linux aarch64; rv:132.0) Gecko/20100101 Firefox/132.0' })).toBe('arm');
        expect(await detectArchitecture({ userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:132.0) Gecko/20100101 Firefox/132.0' })).toBeUndefined();
    });
});
