import type { Breadcrumb } from './breadcrumb';
import type { JsonLdObject } from './json-ld-object';
import { toAbsoluteUrl } from './to-absolute-url';

export function buildBreadcrumbList(breadcrumbs: ReadonlyArray<Breadcrumb>, siteUrl: string): JsonLdObject {
    return {
        '@type': 'BreadcrumbList',
        itemListElement: breadcrumbs.map((breadcrumb: Breadcrumb, index: number): JsonLdObject => ({
            '@type': 'ListItem',
            position: index + 1,
            name: breadcrumb.name,
            item: toAbsoluteUrl(breadcrumb.path, siteUrl),
        })),
    };
}
