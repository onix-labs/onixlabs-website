export function toAbsoluteUrl(path: string, siteUrl: string): string {
    return new URL(path, siteUrl).href;
}
