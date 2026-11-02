import type { SiteSettings } from '../config/site-settings';
import type { JsonLdObject } from './json-ld-object';
import type { PersonDetails } from './person-details';
import { toAbsoluteUrl } from './to-absolute-url';

export function buildProfilePage(person: PersonDetails, site: SiteSettings): JsonLdObject {
    const url: string = toAbsoluteUrl(person.path, site.url);

    return {
        '@type': 'ProfilePage',
        '@id': `${url}#profile`,
        url,
        mainEntity: {
            '@type': 'Person',
            '@id': `${url}#person`,
            name: person.name,
            givenName: person.givenName,
            familyName: person.familyName,
            jobTitle: person.jobTitle,
            description: person.description,
            image: toAbsoluteUrl(person.photo, site.url),
            url,
            sameAs: person.sameAs,
            worksFor: { '@id': `${site.url}/#organization` },
        },
    };
}
