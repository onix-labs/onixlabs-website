export interface PersonDetails {
    readonly name: string;
    readonly givenName: string;
    readonly familyName: string;
    readonly jobTitle: string;
    readonly description: string;
    readonly path: string;
    readonly photo: string;
    readonly sameAs: ReadonlyArray<string>;
}
