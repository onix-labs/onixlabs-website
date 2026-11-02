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
    logo: '/onixlabs/images/logo/logo-orb-96.png',
    foundingYear: 2020,
    contactFormEndpoint: 'https://formspree.io/f/xwpqpeay',
    socialLinks: [
        { name: 'X (Twitter)', url: 'https://x.com/onix_labs', icon: 'x-twitter', isInFooter: true },
        { name: 'Hashnode', url: 'https://onixlabs.hashnode.dev/', icon: 'hashnode', isInFooter: false },
        { name: 'GitHub', url: 'https://github.com/onix-labs', icon: 'github', isInFooter: true },
    ],
};
