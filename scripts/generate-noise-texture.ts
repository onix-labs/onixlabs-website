import path from 'node:path';

import sharp from 'sharp';

// The grain over the blurred brand light, which breaks up the bands a slow gradient shows in 8-bit colour. Each pixel is
// faint black or faint white, so it dithers without changing the light's overall brightness. A file rather than an SVG
// filter, so nothing recalculates it. Seeded, so re-running this (npm run images) reproduces the same files.
const size: number = 256;
const seed: number = 0x4f4e4958;

async function generateNoise(file: string, maximumAlpha: number): Promise<void> {
    let state: number = seed;

    function nextRandom(): number {
        state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
        return state / 0x100000000;
    }

    const pixels: Buffer = Buffer.alloc(size * size * 2);
    for (let index: number = 0; index < pixels.length; index += 2) {
        // A triangular distribution from two uniform values: most pixels are close to zero, and few are at the extremes.
        const grain: number = nextRandom() - nextRandom();
        pixels[index] = grain < 0 ? 0 : 255;
        pixels[index + 1] = Math.round(Math.abs(grain) * maximumAlpha);
    }

    await sharp(pixels, { raw: { width: size, height: size, channels: 2 } }).png({ compressionLevel: 9 }).toFile(path.resolve('public/onixlabs/images', file));
}

await generateNoise('noise.png', 4); // Behind the product windows, deliberately barely visible.
await generateNoise('noise-aura.png', 12); // Over the glass icons' glows, as a visible texture.
