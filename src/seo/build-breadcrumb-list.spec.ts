import { describe, expect, it } from 'vitest';

import { buildBreadcrumbList } from './build-breadcrumb-list';
import type { JsonLdObject } from './json-ld-object';

describe('buildBreadcrumbList', (): void => {
    it('numbers each crumb from one and makes its URL absolute', (): void => {
        const list: JsonLdObject = buildBreadcrumbList(
            [{ name: 'Home', path: '/' }, { name: 'Products', path: '/Products' }],
            'https://www.onixlabs.io',
        );

        expect(list).toEqual({
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.onixlabs.io/' },
                { '@type': 'ListItem', position: 2, name: 'Products', item: 'https://www.onixlabs.io/Products' },
            ],
        });
    });
});
