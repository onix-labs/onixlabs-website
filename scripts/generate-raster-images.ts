import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

import type { RasterTarget } from './raster-target.ts';

// Several SVGs under public/onixlabs/images are wrappers around large embedded bitmaps (up to 1.2 MB each).
// Their viewBoxes are larger than any display size, so rendering at the default density loses no detail.
// This renders each one to a WebP alongside it, sized at twice its largest display width, and the site
// references the WebP. Re-run it (npm run images) after adding or replacing such an SVG.
const imagesRoot: string = path.resolve('public/onixlabs/images');
const targets: ReadonlyArray<RasterTarget> = [
    { directory: 'icons/glass', width: 320 },
    { directory: 'marketing', width: 1400 },
    { directory: 'logo', width: 1280 },
];
// Images shown at a different size from the rest of their directory.
const widthOverrides: ReadonlyMap<string, number> = new Map<string, number>([
    ['logo-full-dark.svg', 340],
    ['logo-full-light.svg', 340],
    ['envelope.svg', 840],
    ['envelope-dark.svg', 840],
]);

async function embedsBitmap(filePath: string): Promise<boolean> {
    const contents: string = await readFile(filePath, 'utf8');
    return contents.includes('data:image');
}

async function render(source: string, width: number): Promise<void> {
    const destination: string = source.replace(/\.svg$/, '.webp');
    await sharp(source, { limitInputPixels: false }).resize({ width }).webp({ quality: 82, effort: 6 }).toFile(destination);
    console.log(`${path.relative(imagesRoot, destination)} (${String(width)}px)`);
}

async function renderTarget(target: RasterTarget): Promise<void> {
    const directory: string = path.join(imagesRoot, target.directory);
    const files: ReadonlyArray<string> = (await readdir(directory)).filter((file: string): boolean => file.endsWith('.svg'));

    await Promise.all(files.map(async (file: string): Promise<void> => {
        const source: string = path.join(directory, file);
        if (await embedsBitmap(source) && !file.startsWith('logo-orb')) {
            await render(source, widthOverrides.get(file) ?? target.width);
        }
    }));
}

await Promise.all(targets.map(renderTarget));
