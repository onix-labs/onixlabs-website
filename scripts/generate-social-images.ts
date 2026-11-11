import { writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

// Builds the images other sites show for ONIXLabs: the default Open Graph image (1200×630) from the full logo SVG, and,
// from the orb (logo-orb.png, exported from Affinity at 1024×1024), the favicons, the Apple touch icon and the 512px
// logo that search engines read from the structured data.
const logoDirectory: string = path.resolve('public/onixlabs/images/logo');
const orbSource: string = path.join(logoDirectory, 'logo-orb.png');
const background: string = '#212529';

async function generateOpenGraphImage(): Promise<void> {
    const logo: Buffer = await sharp(path.join(logoDirectory, 'logo-full-dark.svg'), { limitInputPixels: false }).resize({ width: 760 }).png().toBuffer();
    const glow: Buffer = Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">' +
        '<defs><linearGradient id="bloom" x1="0" x2="1" y1="0" y2="0">' +
        '<stop offset="0" stop-color="#F79533"/><stop offset="0.3" stop-color="#EF4E7B"/>' +
        '<stop offset="0.6" stop-color="#5073B8"/><stop offset="1" stop-color="#6FBA82"/>' +
        '</linearGradient></defs><rect y="606" width="1200" height="24" fill="url(#bloom)"/></svg>',
    );

    await sharp({ create: { width: 1200, height: 630, channels: 4, background } })
        .composite([{ input: logo, gravity: 'center' }, { input: glow, top: 0, left: 0 }])
        .png({ compressionLevel: 9 })
        .toFile(path.join(logoDirectory, 'logo-og.png'));
}

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

await Promise.all([generateOpenGraphImage(), generateOrbSizes(), generateAppleTouchIcon(), generateFaviconIco()]);
