import type { CollectionEntry } from 'astro:content';

export type ProductSection = CollectionEntry<'products'>['data']['sections'][number];
