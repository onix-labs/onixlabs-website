// Section index pages that share their name with a directory of child pages (/archive/Products and /Products/...).
// GitHub Pages may answer /Products with Products.html or redirect it to /Products/, so both files are emitted
// (see emitSectionIndexes in astro.config.ts) and the trailing-slash form, which resolves the same way under
// either behaviour, is the canonical URL.
export const sectionPaths: ReadonlyArray<string> = ['/archive', '/archive/Products', '/archive/Documentation'];
