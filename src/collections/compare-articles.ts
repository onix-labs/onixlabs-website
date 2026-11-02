import type { CollectionEntry } from 'astro:content';

import { documentationCategories } from '../config/documentation-categories';
import type { DocumentationCategory } from '../config/documentation-category';

function categoryIndex(categoryId: string): number {
    return documentationCategories.findIndex((category: DocumentationCategory): boolean => category.id === categoryId);
}

export function compareArticles(left: CollectionEntry<'articles'>, right: CollectionEntry<'articles'>): number {
    return categoryIndex(left.data.category) - categoryIndex(right.data.category) || left.data.order - right.data.order;
}
