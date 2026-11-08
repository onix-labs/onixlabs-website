import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

// Every policy, in its order within its group.
export async function loadPolicies(): Promise<ReadonlyArray<CollectionEntry<'policies'>>> {
    const policies: CollectionEntry<'policies'>[] = await getCollection('policies');
    return policies.toSorted((left: CollectionEntry<'policies'>, right: CollectionEntry<'policies'>): number => left.data.order - right.data.order);
}
