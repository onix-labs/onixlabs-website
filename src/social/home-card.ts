import { CardPictureKind } from './card-picture-kind';
import { SocialCardKind } from './social-card-kind';
import { spectrum } from './spectrum';
import type { StatementCard } from './statement-card';

// The home page's card, which is also the card of every page without one of its own. Its wording is About's headline.
export const homeCard: StatementCard = {
    kind: SocialCardKind.Statement,
    path: '/',
    alt: 'ONIXLabs: Think beyond code, build beyond limits',
    title: 'Think beyond code',
    highlight: 'Build beyond limits',
    colours: spectrum,
    sizes: { title: 66, highlight: 66 },
    picture: { kind: CardPictureKind.Image, source: '/onixlabs/images/logo/logo-orb.png', glowsInOwnColours: true, size: 320 },
};
