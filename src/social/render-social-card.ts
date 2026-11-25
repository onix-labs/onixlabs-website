import satori from 'satori';
import sharp from 'sharp';

import { cardTheme } from './card-theme';
import type { CardNode } from './card-node';
import { composeSocialCard } from './compose-social-card';
import { loadCardFonts } from './load-card-fonts';
import type { SocialCard } from './social-card';

// Draws a card. Satori lays it out as an SVG, with its text as outlines, and sharp draws that. A JPEG, because WhatsApp
// ignores an image of more than a few hundred kilobytes, and full chroma, because coloured text smears without it.
export async function renderSocialCard(card: SocialCard): Promise<Buffer> {
    const node: CardNode = await composeSocialCard(card);
    const svg: string = await satori(node, { width: cardTheme.width, height: cardTheme.height, fonts: await loadCardFonts() });

    return await sharp(Buffer.from(svg), { unlimited: true })
        .flatten({ background: cardTheme.background })
        .jpeg({ quality: 88, chromaSubsampling: '4:4:4', mozjpeg: true })
        .toBuffer();
}
