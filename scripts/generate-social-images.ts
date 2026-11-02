import path from 'node:path';

import sharp from 'sharp';

// Builds the default Open Graph image (1200×630) and the Apple touch icon from the logo SVGs.
const logoDirectory: string = path.resolve('public/onixlabs/images/logo');
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

async function generateAppleTouchIcon(): Promise<void> {
    const orb: Buffer = await sharp(path.join(logoDirectory, 'logo-orb.svg'), { limitInputPixels: false }).resize({ width: 140 }).png().toBuffer();

    await sharp({ create: { width: 180, height: 180, channels: 4, background } })
        .composite([{ input: orb, gravity: 'center' }])
        .png({ compressionLevel: 9 })
        .toFile(path.join(logoDirectory, 'logo-orb-180.png'));
}

await Promise.all([generateOpenGraphImage(), generateAppleTouchIcon()]);
