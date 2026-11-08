// The legal entity that operates the site, as recorded at Companies House. Shown on /Legal/Company-Information and in the
// footer, as UK trading-disclosure rules require, and used throughout the policies.
export interface CompanyDetails {
    readonly legalName: string;
    readonly number: string;
    readonly type: string;
    readonly registeredIn: string;
    readonly registeredOffice: ReadonlyArray<string>;
    readonly incorporated: string;
    readonly natureOfBusiness: string;
    readonly director: string;
    readonly email: string;
    readonly companiesHouseUrl: string;
}
