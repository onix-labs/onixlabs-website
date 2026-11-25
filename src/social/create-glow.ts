import sharp from 'sharp';

import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';
import { createImageNode } from './create-image-node';
import { loadCardImage } from './load-card-image';

// How far the blur reaches, as a fraction of the image's size.
const blur: number = 0.16;

// An image's own colours as light behind it, on a canvas `size` wide, for an image without a glow from generate-auras.ts.
export async function createGlow(source: string, imageSize: number, size: number, style: CardStyle): Promise<CardNode> {
    const pad: number = Math.round((size - imageSize) / 2);
    const image: Buffer = await loadCardImage(source, imageSize, imageSize);
    const padded: Buffer = await sharp(image)
        .extend({ top: pad, bottom: pad, left: pad, right: pad, background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
    // Resized in the same pipeline, so sharp premultiplies the alpha and the blur doesn't spread the dark around the image.
    const glow: Buffer = await sharp(padded)
        .resize({ width: size, height: size })
        .blur(imageSize * blur)
        .png()
        .toBuffer();

    return createImageNode(glow, size, size, style);
}
