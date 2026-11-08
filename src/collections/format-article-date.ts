const articleDate: Intl.DateTimeFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

// An article's publication date as readers see it, such as "March 12, 2022". Dates are calendar days, so they're read in
// UTC, where the content loader puts them, rather than in the build machine's time zone.
export function formatArticleDate(date: Date): string {
    return articleDate.format(date);
}
