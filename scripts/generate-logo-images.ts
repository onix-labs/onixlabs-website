import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

// Builds the images that stand for ONIXLabs elsewhere, from the orb (logo-orb.png, exported from Affinity at 1024×1024):
// the favicons, the Apple touch icon and the 512px logo that search engines read from the structured data.
const logoDirectory: string = path.resolve('public/onixlabs/images/logo');
const orbSource: string = path.join(logoDirectory, 'logo-orb.png');
const background: string = '#212529';

async function orbAt(size: number): Promise<Buffer> {
    return await sharp(orbSource).resize({ width: size, height: size }).png({ compressionLevel: 9 }).toBuffer();
}

// The orb on transparency at the sizes the pages link to: 48 and 96 for favicons (search results use a multiple of 48),
// and 512 for the Organization logo in the structured data (search engines want at least 112).
async function generateOrbSizes(): Promise<void> {
    await Promise.all([48, 96, 512].map(async (size: number): Promise<void> => {
        await writeFile(path.join(logoDirectory, `logo-orb-${String(size)}.png`), await orbAt(size));
    }));
}

// iOS doesn't keep transparency on home-screen icons, so the orb sits on the dark background with room around it.
async function generateAppleTouchIcon(): Promise<void> {
    await sharp({ create: { width: 180, height: 180, channels: 4, background } })
        .composite([{ input: await orbAt(140), gravity: 'center' }])
        .png({ compressionLevel: 9 })
        .toFile(path.join(logoDirectory, 'logo-orb-180.png'));
}

// /favicon.ico, which browsers and crawlers request whatever the page links to. An ICO file is a directory of images; each
// entry here holds a PNG, which every current browser reads.
async function generateFaviconIco(): Promise<void> {
    const sizes: ReadonlyArray<number> = [16, 32, 48];
    const images: ReadonlyArray<Buffer> = await Promise.all(sizes.map(orbAt));
    const header: Buffer = Buffer.alloc(6);

    header.writeUInt16LE(0, 0);
    header.writeUInt16LE(1, 2);
    header.writeUInt16LE(sizes.length, 4);

    let offset: number = 6 + 16 * sizes.length;
    const entries: ReadonlyArray<Buffer> = images.map((image: Buffer, index: number): Buffer => {
        const entry: Buffer = Buffer.alloc(16);
        const size: number = sizes[index] ?? 0;

        entry.writeUInt8(size, 0);
        entry.writeUInt8(size, 1);
        entry.writeUInt16LE(1, 4);
        entry.writeUInt16LE(32, 6);
        entry.writeUInt32LE(image.length, 8);
        entry.writeUInt32LE(offset, 12);
        offset += image.length;

        return entry;
    });

    await writeFile(path.resolve('public/favicon.ico'), Buffer.concat([header, ...entries, ...images]));
}

await Promise.all([generateOrbSizes(), generateAppleTouchIcon(), generateFaviconIco()]);
