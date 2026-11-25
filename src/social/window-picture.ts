import type { CardPictureKind } from './card-picture-kind';

// One window, as a macOS screenshot with its shadow around it.
export interface WindowPicture {
    readonly kind: CardPictureKind.Window;
    readonly source: string;
}
