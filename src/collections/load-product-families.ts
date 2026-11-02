import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export async function loadProductFamilies(): Promise<ReadonlyArray<CollectionEntry<'productFamilies'>>> {
    const families: CollectionEntry<'productFamilies'>[] = await getCollection('productFamilies');
    return families.toSorted(
        (left: CollectionEntry<'productFamilies'>, right: CollectionEntry<'productFamilies'>): number => left.data.order - right.data.order,
    );
}
