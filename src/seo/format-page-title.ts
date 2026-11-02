// Page name first, brand last: search results truncate from the end, so the distinctive part survives.
export function formatPageTitle(title: string, siteName: string): string {
    return title === siteName || title.startsWith(`${siteName} `) ? title : `${title} | ${siteName}`;
}
