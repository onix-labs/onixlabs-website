import { getCollection, getEntry } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

import { loadProducts } from '../collections/load-products';
import { CardPictureKind } from './card-picture-kind';
import { familyColours } from './family-colours';
import { findLibraryFamily } from './find-library-family';
import { productAppearances } from './product-appearances';
import { SocialCardKind } from './social-card-kind';
import type { StatementCard } from './statement-card';

type LibraryPage = CollectionEntry<'libraryPages'>;
type Package = LibraryPage['data']['packages'][number];

// The cards of the library pages and of the products in their families, whose glass icons the library pages give.
export async function loadLibraryCards(): Promise<ReadonlyArray<StatementCard>> {
    const pages: ReadonlyArray<LibraryPage> = await getCollection('libraryPages');
    const products: ReadonlyArray<CollectionEntry<'products'>> = await loadProducts();

    const productCards: ReadonlyArray<StatementCard> = await Promise.all(
        products.map(async (product: CollectionEntry<'products'>): Promise<StatementCard> => await buildProductCard(product, pages)),
    );

    return [...pages.map(buildLibraryCard), ...productCards];
}

function buildLibraryCard({ data }: LibraryPage): StatementCard {
    return {
        kind: SocialCardKind.Statement,
        path: data.path,
        alt: `ONIXLabs ${data.title}: ${data.highlight}`,
        title: data.title,
        highlight: data.highlight,
        sizes: { title: 66, highlight: 66 },
        ...productAppearances[findLibraryFamily(data.family.id)],
    };
}

async function buildProductCard({ data }: CollectionEntry<'products'>, pages: ReadonlyArray<LibraryPage>): Promise<StatementCard> {
    const family: CollectionEntry<'productFamilies'> = await getEntry(data.family);
    const pkg: Package | undefined = pages
        .flatMap((page: LibraryPage): ReadonlyArray<Package> => page.data.packages)
        .find((candidate: Package): boolean => candidate.pagePath === data.path);

    return {
        kind: SocialCardKind.Statement,
        path: data.path,
        alt: `ONIXLabs ${data.title}: ${data.callout}`,
        label: `ONIXLabs for ${family.data.name}`,
        title: data.title,
        lead: data.callout,
        colours: familyColours[findLibraryFamily(data.family.id)],
        picture: { kind: CardPictureKind.Glass, name: pkg?.glass ?? 'code' },
    };
}
