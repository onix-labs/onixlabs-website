import type { CardNode } from './card-node';
import type { CardPicture } from './card-picture';
import { CardPictureKind } from './card-picture-kind';
import { composeImagePicture } from './compose-image-picture';
import { composeWindowPicture } from './compose-window-picture';
import { composeWindowsPicture } from './compose-windows-picture';

// The right-hand side of a statement card.
export async function composePicture(picture: CardPicture): Promise<CardNode> {
    switch (picture.kind) {
        case CardPictureKind.Glass: {
            const base: string = `/onixlabs/images/icons/glass/${picture.name}`;
            return await composeImagePicture({ kind: CardPictureKind.Image, source: `${base}-dark.webp`, aura: `${base}-aura-dark.webp`, size: 340 });
        }
        case CardPictureKind.Image:
            return await composeImagePicture(picture);
        case CardPictureKind.Window:
            return await composeWindowPicture(picture);
        case CardPictureKind.Windows:
            return await composeWindowsPicture(picture);
    }
}
