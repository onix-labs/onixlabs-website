import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export async function loadProducts(): Promise<ReadonlyArray<CollectionEntry<'products'>>> {
    const products: CollectionEntry<'products'>[] = await getCollection('products');
    return products.toSorted((left: CollectionEntry<'products'>, right: CollectionEntry<'products'>): number => left.data.order - right.data.order);
}
