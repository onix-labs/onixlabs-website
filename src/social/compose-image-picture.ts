import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';
import { cardTheme } from './card-theme';
import { createBox } from './create-box';
import { createGlow } from './create-glow';
import { createImage } from './create-image';
import type { ImagePicture } from './image-picture';

const centreX: number = 940;
const centreY: number = 336;
// A glow's canvas is this many times its image's size (generate-auras.ts).
const auraScale: number = 2.2;

// An image over its glow, if it has one.
export async function composeImagePicture(picture: ImagePicture): Promise<CardNode> {
    const { source, size }: ImagePicture = picture;
    const [glow, image]: [ReadonlyArray<CardNode>, CardNode] = await Promise.all([
        composeGlow(picture),
        createImage(source, size, size, { position: 'absolute', left: centreX - size / 2, top: centreY - size / 2 }),
    ]);

    return createBox({ position: 'absolute', left: 0, top: 0, width: cardTheme.width, height: cardTheme.height, overflow: 'hidden' }, [...glow, image]);
}

async function composeGlow({ source, aura, glowsInOwnColours = false, size }: ImagePicture): Promise<ReadonlyArray<CardNode>> {
    const glow: number = Math.round(size * auraScale);
    const style: CardStyle = { position: 'absolute', left: centreX - glow / 2, top: centreY - glow / 2 };

    if (aura !== undefined) {
        return [await createImage(aura, glow, glow, style)];
    }

    return glowsInOwnColours ? [await createGlow(source, size, glow, style)] : [];
}
