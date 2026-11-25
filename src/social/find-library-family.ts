import type { LibraryFamily } from './library-family';

const families: ReadonlyArray<LibraryFamily> = ['dotnet', 'corda', 'kotlin'];

// The family with an id from the content, which the schemas leave as any string.
export function findLibraryFamily(id: string): LibraryFamily {
    const family: LibraryFamily | undefined = families.find((candidate: LibraryFamily): boolean => candidate === id);

    if (family === undefined) {
        throw new Error(`src/social has no colours for the '${id}' product family: add them to family-colours.ts and product-appearances.ts.`);
    }

    return family;
}
