import type { CardAppearance } from './card-appearance';
import { CardPictureKind } from './card-picture-kind';
import type { CardSubject } from './card-subject';
import { familyColours } from './family-colours';
import { spectrum } from './spectrum';

// The colours and picture of each product's or family's card, which the article that introduces it shares.
export const productAppearances: Readonly<Record<CardSubject, CardAppearance>> = {
    studio: {
        colours: spectrum,
        picture: { kind: CardPictureKind.Windows, screens: ['3-os-de', '8-os-ai', '1-os-ws'] },
    },
    aero: {
        colours: spectrum,
        picture: {
            kind: CardPictureKind.Image,
            source: '/onixlabs/images/marketing/aero-dark.webp',
            aura: '/onixlabs/images/marketing/aero-aura-dark.webp',
            size: 500,
        },
    },
    player: {
        colours: spectrum,
        picture: { kind: CardPictureKind.Window, source: '/onixlabs/images/marketing/onixplayer-dark.webp' },
    },
    dotnet: {
        colours: familyColours.dotnet,
        picture: { kind: CardPictureKind.Image, source: '/onixlabs/images/logo/dotnet.webp', size: 320 },
    },
    corda: {
        colours: familyColours.corda,
        picture: { kind: CardPictureKind.Image, source: '/onixlabs/images/logo/corda.svg', size: 320 },
    },
    kotlin: {
        colours: familyColours.kotlin,
        picture: { kind: CardPictureKind.Image, source: '/onixlabs/images/logo/kotlin.svg', size: 320 },
    },
};
