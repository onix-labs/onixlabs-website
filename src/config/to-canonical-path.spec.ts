import { describe, expect, it } from 'vitest';

import { toCanonicalPath } from './to-canonical-path';

describe('toCanonicalPath', (): void => {
    it('adds a trailing slash to section index pages', (): void => {
        const path: string = toCanonicalPath('/Products');

        expect(path).toBe('/Products/');
    });

    it('leaves other pages unchanged', (): void => {
        const productPath: string = toCanonicalPath('/Products/DotNet/Core');
        const homePath: string = toCanonicalPath('/');

        expect(productPath).toBe('/Products/DotNet/Core');
        expect(homePath).toBe('/');
    });
});
