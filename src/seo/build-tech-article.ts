import type { SiteSettings } from '../config/site-settings';
import type { JsonLdObject } from './json-ld-object';
import type { TechArticleDetails } from './tech-article-details';
import { toAbsoluteUrl } from './to-absolute-url';

export function buildTechArticle(article: TechArticleDetails, site: SiteSettings): JsonLdObject {
    const url: string = toAbsoluteUrl(article.path, site.url);
    const author: JsonLdObject = article.authorName !== undefined && article.authorPath !== undefined
        ? { '@type': 'Person', name: article.authorName, url: toAbsoluteUrl(article.authorPath, site.url) }
        : { '@id': `${site.url}/#organization` };

    return {
        '@type': 'TechArticle',
        '@id': `${url}#article`,
        headline: article.title,
        description: article.description,
        url,
        mainEntityOfPage: url,
        articleSection: article.section,
        inLanguage: 'en-GB',
        author,
        publisher: { '@id': `${site.url}/#organization` },
        image: toAbsoluteUrl(site.defaultImage, site.url),
        ...(article.published !== undefined ? { datePublished: article.published.toISOString() } : {}),
        ...(article.updated !== undefined ? { dateModified: article.updated.toISOString() } : {}),
    };
}
