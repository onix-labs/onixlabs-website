// Where the card for a page is published. The home page has no name of its own.
export function toSocialCardPath(pagePath: string): string {
    return `/social${pagePath === '/' ? '/Home' : pagePath}.jpg`;
}
