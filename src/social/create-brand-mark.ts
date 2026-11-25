import type { CardNode } from './card-node';
import { cardTheme } from './card-theme';
import { createImage } from './create-image';

// The ONIXLabs logo, where every card but a profile's has it: the top left corner.
export async function createBrandMark(): Promise<CardNode> {
    return await createImage('/onixlabs/images/logo/logo-full-dark.svg', 254, 48, { position: 'absolute', left: cardTheme.margin, top: 56 });
}
