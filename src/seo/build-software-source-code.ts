import type { SiteSettings } from '../config/site-settings';
import type { JsonLdObject } from './json-ld-object';
import type { SoftwareSourceCodeDetails } from './software-source-code-details';
import { toAbsoluteUrl } from './to-absolute-url';

export function buildSoftwareSourceCode(product: SoftwareSourceCodeDetails, site: SiteSettings): JsonLdObject {
    const url: string = toAbsoluteUrl(product.path, site.url);

    return {
        '@type': 'SoftwareSourceCode',
        '@id': `${url}#software`,
        name: product.name,
        description: product.description,
        url,
        codeRepository: product.repositoryUrl,
        programmingLanguage: product.programmingLanguage,
        image: toAbsoluteUrl(product.image, site.url),
        author: { '@id': `${site.url}/#organization` },
        publisher: { '@id': `${site.url}/#organization` },
    };
}
