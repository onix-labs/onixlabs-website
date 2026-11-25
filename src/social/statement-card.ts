import type { BrandColour } from './brand-colour';
import type { CardPicture } from './card-picture';
import type { HeadlineSizes } from './headline-sizes';
import type { SocialCardKind } from './social-card-kind';

// A headline beside a picture, over a bloom. `path` is the page it's for, and `alt` describes it.
export interface StatementCard {
    readonly kind: SocialCardKind.Statement;
    readonly path: string;
    readonly alt: string;
    readonly label?: string;
    readonly title: string;
    // The headline's second phrase, in the card's colours.
    readonly highlight?: string;
    // Sizes for a headline whose phrases each take one line; without them, it wraps at a size chosen for its length.
    readonly sizes?: HeadlineSizes;
    // A line beneath the headline.
    readonly lead?: string;
    readonly colours: ReadonlyArray<BrandColour>;
    readonly picture: CardPicture;
}
