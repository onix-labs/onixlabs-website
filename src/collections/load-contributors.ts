import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export async function loadContributors(): Promise<ReadonlyArray<CollectionEntry<'contributors'>>> {
    const contributors: CollectionEntry<'contributors'>[] = await getCollection('contributors');
    return contributors.toSorted(
        (left: CollectionEntry<'contributors'>, right: CollectionEntry<'contributors'>): number => left.data.order - right.data.order,
    );
}
