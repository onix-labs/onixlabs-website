import type { BrandColour } from './brand-colour';
import type { CardPicture } from './card-picture';

export interface CardAppearance {
    readonly colours: ReadonlyArray<BrandColour>;
    readonly picture: CardPicture;
}
