import { readdir } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

// The Studio screenshots are 1712px wide, but a phone shows them at about 300px and a laptop at about 700px, so each
// also gets a half-size copy, <id>-l-856.webp and <id>-d-856.webp, for the srcset on StudioHero, StudioProductHero and
// StudioWindow. Re-run it (npm run images) after adding or replacing a screenshot.
const directory: string = path.resolve('public/onixlabs/images/studio');
const width: number = 856;

const files: ReadonlyArray<string> = (await readdir(directory)).filter((file: string): boolean => /-[ld]\.webp$/.test(file));

await Promise.all(files.map(async (file: string): Promise<void> => {
    const destination: string = path.join(directory, file.replace(/\.webp$/, `-${String(width)}.webp`));
    await sharp(path.join(directory, file)).resize({ width }).webp({ quality: 82, effort: 6 }).toFile(destination);
    console.log(path.basename(destination));
}));
