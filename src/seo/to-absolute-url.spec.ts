import { describe, expect, it } from 'vitest';

import { toAbsoluteUrl } from './to-absolute-url';

describe('toAbsoluteUrl', (): void => {
    it('resolves a site-relative path against the site URL', (): void => {
        const url: string = toAbsoluteUrl('/Products/DotNet/Core', 'https://www.onixlabs.io');

        expect(url).toBe('https://www.onixlabs.io/Products/DotNet/Core');
    });

    it('keeps the trailing slash on the home page', (): void => {
        const url: string = toAbsoluteUrl('/', 'https://www.onixlabs.io');

        expect(url).toBe('https://www.onixlabs.io/');
    });

    it('preserves the case of the path', (): void => {
        const url: string = toAbsoluteUrl('/Documentation/CSharp/Underscore-Overkill', 'https://www.onixlabs.io');

        expect(url).toBe('https://www.onixlabs.io/Documentation/CSharp/Underscore-Overkill');
    });
});
