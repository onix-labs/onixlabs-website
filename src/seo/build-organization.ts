import type { SiteSettings } from '../config/site-settings';
import type { SocialLink } from '../config/social-link';
import type { JsonLdObject } from './json-ld-object';
import { toAbsoluteUrl } from './to-absolute-url';

export function buildOrganization(site: SiteSettings): JsonLdObject {
    return {
        '@type': 'Organization',
        '@id': `${site.url}/#organization`,
        name: site.name,
        url: `${site.url}/`,
        logo: toAbsoluteUrl(site.logo, site.url),
        foundingDate: String(site.foundingYear),
        description: site.description,
        sameAs: site.socialLinks.map((link: SocialLink): string => link.url),
    };
}
