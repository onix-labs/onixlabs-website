import type { SiteSettings } from '../config/site-settings';
import type { JsonLdObject } from './json-ld-object';

export function buildWebsite(site: SiteSettings): JsonLdObject {
    return {
        '@type': 'WebSite',
        '@id': `${site.url}/#website`,
        name: site.name,
        url: `${site.url}/`,
        inLanguage: 'en-GB',
        publisher: { '@id': `${site.url}/#organization` },
    };
}
