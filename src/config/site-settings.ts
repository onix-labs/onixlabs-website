import type { CompanyDetails } from './company-details';
import type { SocialLink } from './social-link';

export interface SiteSettings {
    readonly name: string;
    readonly url: string;
    readonly description: string;
    readonly locale: string;
    readonly twitterHandle: string;
    readonly defaultImage: string;
    readonly defaultImageAlt: string;
    readonly logo: string;
    readonly foundingYear: number;
    readonly contactFormEndpoint: string;
    readonly socialLinks: ReadonlyArray<SocialLink>;
    readonly company: CompanyDetails;
}
