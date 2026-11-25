import type { CardPictureKind } from './card-picture-kind';

// One glass icon over its glow. `name` is a glass icon in public/onixlabs/images/icons/glass.
export interface GlassPicture {
    readonly kind: CardPictureKind.Glass;
    readonly name: string;
}
