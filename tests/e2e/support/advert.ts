// An article and the advert it's expected to carry: the advert's accessible name and where its button leads.
export interface Advert {
    readonly article: string;
    readonly name: string;
    readonly href: string;
}
