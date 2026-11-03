import { describe, expect, it } from 'vitest';

import { toCanonicalPath } from './to-canonical-path';

describe('toCanonicalPath', (): void => {
    it('adds a trailing slash to section index pages', (): void => {
        const path: string = toCanonicalPath('/archive/Products');

        expect(path).toBe('/archive/Products/');
    });

    it('leaves other pages unchanged', (): void => {
        const productPath: string = toCanonicalPath('/archive/Products/DotNet/Core');
        const homePath: string = toCanonicalPath('/');

        expect(productPath).toBe('/archive/Products/DotNet/Core');
        expect(homePath).toBe('/');
    });
});
