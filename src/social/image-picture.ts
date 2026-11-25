import type { CardPictureKind } from './card-picture-kind';

// A square picture, drawn at `size`, over its glow, if it has one: the aura rendered for it by generate-auras.ts, or one
// made from its own colours.
export interface ImagePicture {
    readonly kind: CardPictureKind.Image;
    readonly source: string;
    readonly aura?: string;
    readonly glowsInOwnColours?: boolean;
    readonly size: number;
}
