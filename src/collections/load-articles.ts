import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import { compareArticles } from './compare-articles';

export async function loadArticles(): Promise<ReadonlyArray<CollectionEntry<'articles'>>> {
    const articles: CollectionEntry<'articles'>[] = await getCollection('articles');
    return articles.toSorted(compareArticles);
}
