import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';
import type { Metadata } from 'sharp';

import type { RasterTarget } from './raster-target.ts';

// Several SVGs under public/onixlabs/images are wrappers around large embedded bitmaps (up to 1.2 MB each).
// This renders each one to a WebP alongside it, sized at twice its largest display width, and the site
// references the WebP. Re-run it (npm run images) after adding or replacing such an SVG.
const baseDensity: number = 72;
const imagesRoot: string = path.resolve('public/onixlabs/images');
const targets: ReadonlyArray<RasterTarget> = [
    { directory: 'icons/glass', width: 640, quality: 90 }, // The largest is 16rem on a bento tile, zoomed 1.12 on hover.
    { directory: 'heroes', width: 2560, quality: 90 }, // Up to the 80rem wide container.
    { directory: 'marketing', width: 1400, quality: 82 },
    { directory: 'logo', width: 1280, quality: 82 },
];
// Images shown at a different size from the rest of their directory.
const widthOverrides: ReadonlyMap<string, number> = new Map<string, number>([
    ['logo-full-dark.svg', 340],
    ['logo-full-light.svg', 340],
    ['dotnet.svg', 256],
]);
// The glass icons are exported as WebPs straight from Affinity, which renders their blurs at full resolution rather
// than stretching the 1× bitmaps it embeds in an SVG, so rendering them here would overwrite better images.
function isExportedFromAffinity(directory: string): boolean {
    return directory === 'icons/glass';
}

async function embedsBitmap(filePath: string): Promise<boolean> {
    const contents: string = await readFile(filePath, 'utf8');
    return contents.includes('data:image');
}

// SVGs rasterise at their own size before any resize, and some are smaller than their target, so scale those up by
// density: resizing the result would only stretch a bitmap.
async function render(source: string, width: number, quality: number): Promise<void> {
    const destination: string = source.replace(/\.svg$/, '.webp');
    const { width: nativeWidth }: Metadata = await sharp(source, { limitInputPixels: false }).metadata();
    const density: number = baseDensity * Math.max(1, width / nativeWidth);
    await sharp(source, { limitInputPixels: false, density }).resize({ width }).webp({ quality, effort: 6 }).toFile(destination);
    console.log(`${path.relative(imagesRoot, destination)} (${String(width)}px)`);
}

async function renderTarget(target: RasterTarget): Promise<void> {
    const directory: string = path.join(imagesRoot, target.directory);
    const files: ReadonlyArray<string> = (await readdir(directory))
        .filter((file: string): boolean => file.endsWith('.svg') && !isExportedFromAffinity(target.directory));

    await Promise.all(files.map(async (file: string): Promise<void> => {
        const source: string = path.join(directory, file);
        if (await embedsBitmap(source) && !file.startsWith('logo-orb')) {
            await render(source, widthOverrides.get(file) ?? target.width, target.quality);
        }
    }));
}

await Promise.all(targets.map(renderTarget));
