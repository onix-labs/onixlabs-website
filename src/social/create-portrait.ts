import sharp from 'sharp';

import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';
import { createImageNode } from './create-image-node';
import { loadCardImage } from './load-card-image';

// A square portrait that fades out to the left and at the bottom. A mask, so the bloom shows through.
export async function createPortrait(source: string, size: number, style: CardStyle): Promise<CardNode> {
    const portrait: Buffer = await sharp(await loadCardImage(source, size, size))
        .ensureAlpha()
        .composite([
            { input: buildFade(size, 'x1="0" y1="0" x2="1" y2="0"', 0.5), blend: 'dest-in' },
            { input: buildFade(size, 'x1="0" y1="1" x2="0" y2="0"', 0.38), blend: 'dest-in' },
        ])
        .png()
        .toBuffer();

    return createImageNode(portrait, size, size, style);
}

// Eased, so neither end of the fade shows as an edge.
function buildFade(size: number, direction: string, length: number): Buffer {
    const stops: string = [[0, 0], [0.25, 0.1], [0.5, 0.45], [0.75, 0.85], [1, 1]]
        .map(([position, opacity]: ReadonlyArray<number>): string => `<stop offset="${String((position ?? 0) * length)}" stop-color="#fff" stop-opacity="${String(opacity ?? 1)}"/>`)
        .join('');

    return Buffer.from(
        `<svg xmlns="http://www.w3.org/2000/svg" width="${String(size)}" height="${String(size)}"><defs><linearGradient id="fade" ${direction}>${stops}</linearGradient></defs>` +
        `<rect width="${String(size)}" height="${String(size)}" fill="url(#fade)"/></svg>`,
    );
}
