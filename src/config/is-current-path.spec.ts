import { describe, expect, it } from 'vitest';

import { isCurrentPath } from './is-current-path';
import type { NavigationItem } from './navigation-item';

const home: NavigationItem = { label: 'Home', path: '/', exact: true };
const products: NavigationItem = { label: 'Products', path: '/Products', exact: false };

describe('isCurrentPath', (): void => {
    it('matches the home page only exactly', (): void => {
        const isHome: boolean = isCurrentPath(home, '/');
        const isProducts: boolean = isCurrentPath(home, '/Products');

        expect(isHome).toBe(true);
        expect(isProducts).toBe(false);
    });

    it('matches a section and the pages beneath it', (): void => {
        const isIndex: boolean = isCurrentPath(products, '/Products');
        const isChild: boolean = isCurrentPath(products, '/Products/DotNet/Core');

        expect(isIndex).toBe(true);
        expect(isChild).toBe(true);
    });

    it('ignores the .html extension and a trailing slash', (): void => {
        const withExtension: boolean = isCurrentPath(products, '/Products.html');
        const withSlash: boolean = isCurrentPath(products, '/Products/');

        expect(withExtension).toBe(true);
        expect(withSlash).toBe(true);
    });

    it('does not match a section that merely shares a prefix', (): void => {
        const isMatch: boolean = isCurrentPath(products, '/ProductsArchive');

        expect(isMatch).toBe(false);
    });
});
