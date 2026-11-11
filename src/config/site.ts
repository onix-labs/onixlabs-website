import type { SiteSettings } from './site-settings';

// The canonical host is www.onixlabs.io because that's what CNAME serves; the apex redirects to it.
export const site: SiteSettings = {
    name: 'ONIXLabs',
    url: 'https://www.onixlabs.io',
    description:
        'ONIXLabs delivers expert enterprise software engineering, building high-quality C#, .NET, Java, Kotlin, JVM, ' +
        'and Corda solutions, frameworks, and consulting services to accelerate scalable, secure business applications.',
    locale: 'en_GB',
    twitterHandle: '@onix_labs',
    defaultImage: '/onixlabs/images/logo/logo-og.png',
    defaultImageAlt: 'ONIXLabs logo',
    logo: '/onixlabs/images/logo/logo-orb-512.png',
    foundingYear: 2020,
    contactFormEndpoint: 'https://formspree.io/f/xwpqpeay',
    calendlyUrl: 'https://calendly.com/onixlabs',
    socialLinks: [
        { name: 'X (Twitter)', url: 'https://x.com/onix_labs', icon: 'x-logo', isInFooter: true },
        { name: 'GitHub', url: 'https://github.com/onix-labs', icon: 'github-logo', isInFooter: true },
    ],
    // Verified against Companies House on 8 November 2026. The brand dates from 2020 (foundingYear); the company from 2021.
    company: {
        legalName: 'ONIXLABS LIMITED',
        number: '13661968',
        type: 'Private limited company',
        registeredIn: 'England and Wales',
        registeredOffice: ['27 Old Gloucester Street', 'London', 'WC1N 3AX', 'United Kingdom'],
        incorporated: '5 October 2021',
        natureOfBusiness: 'Business and domestic software development (SIC 62012)',
        director: 'Matthew Layton',
        email: 'admin@onixlabs.io',
        companiesHouseUrl: 'https://find-and-update.company-information.service.gov.uk/company/13661968',
        duns: '228339519',
    },
};
