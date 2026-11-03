import { mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

// Resizes the ONIXLabs Studio screenshots (light and dark pairs, with transparent window shadows) for the web.
// Usage: node scripts/generate-studio-screenshots.ts <folder of os-*-light.webp / os-*-dark.webp>
const sourceDirectory: string | undefined = process.argv[2];
const outputDirectory: string = path.resolve('public/onixlabs/images/studio');
const widths: ReadonlyArray<number> = [960, 1600];

if (sourceDirectory === undefined) {
    throw new Error('Pass the folder that holds the screenshots.');
}

async function resize(file: string): Promise<void> {
    const source: string = path.join(sourceDirectory ?? '', file);
    const name: string = file.replace(/^os-/, '').replace(/\.webp$/, '');

    await Promise.all(widths.map(async (width: number): Promise<void> => {
        await sharp(source).resize({ width, withoutEnlargement: true }).webp({ quality: 80, alphaQuality: 90, effort: 6 })
            .toFile(path.join(outputDirectory, `${name}-${String(width)}.webp`));
    }));
}

await mkdir(outputDirectory, { recursive: true });
const files: ReadonlyArray<string> = (await readdir(sourceDirectory)).filter((file: string): boolean => /^os-.+-(light|dark)\.webp$/.test(file));
await Promise.all(files.map(resize));
console.log(`${String(files.length)} screenshots → ${outputDirectory}`);
