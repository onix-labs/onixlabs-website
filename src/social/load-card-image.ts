import path from 'node:path';

import sharp from 'sharp';

// An image under public/ as a PNG at the size it's drawn, because Satori can't read WebP.
export async function loadCardImage(source: string, width: number, height: number): Promise<Buffer> {
    return await sharp(path.resolve('public', source.replace(/^\//, '')), { limitInputPixels: false })
        .resize({ width, height, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
        .png()
        .toBuffer();
}
