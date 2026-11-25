import type { CollectionEntry } from 'astro:content';

import { loadArticles } from '../collections/load-articles';
import { documentationCategories } from '../config/documentation-categories';
import type { DocumentationCategory } from '../config/documentation-category';
import { CardPictureKind } from './card-picture-kind';
import { productAppearances } from './product-appearances';
import { SocialCardKind } from './social-card-kind';
import type { StatementCard } from './statement-card';

export async function loadArticleCards(): Promise<ReadonlyArray<StatementCard>> {
    return (await loadArticles()).map(({ data }: CollectionEntry<'articles'>): StatementCard => {
        const category: DocumentationCategory | undefined = documentationCategories.find(
            (candidate: DocumentationCategory): boolean => candidate.id === data.category,
        );

        if (category === undefined) {
            throw new Error(`src/config/documentation-categories.ts has no '${data.category}' category, which ${data.path} is in.`);
        }

        return {
            kind: SocialCardKind.Statement,
            path: data.path,
            alt: `ONIXLabs documentation: ${data.title}`,
            label: category.name,
            title: data.title,
            ...(data.introduces === undefined ? { colours: category.cardColours, picture: { kind: CardPictureKind.Glass, name: category.cardGlass } } : productAppearances[data.introduces]),
        };
    });
}
