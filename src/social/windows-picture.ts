import type { CardPictureKind } from './card-picture-kind';

// Studio screenshots, stacked from the back to the front. Each is the id of a screen in src/config/studio-screens.ts.
export interface WindowsPicture {
    readonly kind: CardPictureKind.Windows;
    readonly screens: ReadonlyArray<string>;
}
