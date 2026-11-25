import { CardPictureKind } from './card-picture-kind';
import { homeCard } from './home-card';
import { productAppearances } from './product-appearances';
import { SocialCardKind } from './social-card-kind';
import { spectrum } from './spectrum';
import type { StatementCard } from './statement-card';

// The cards of the pages whose copy lives in their .astro files. Their wording follows those pages' headlines.
export function buildPageCards(): ReadonlyArray<StatementCard> {
    return [
        homeCard,
        {
            kind: SocialCardKind.Statement,
            path: '/Products/Studio',
            alt: 'ONIXLabs Studio: a workspace with a code editor and an agent, over other Studio screens',
            title: 'ONIXLabs Studio',
            highlight: 'Agentic Engineering',
            sizes: { title: 66, highlight: 54 },
            ...productAppearances.studio,
        },
        {
            kind: SocialCardKind.Statement,
            path: '/Products/Aero',
            alt: 'ONIXLabs Aero: Enterprise stack for .NET, with its modules around it',
            title: 'ONIXLabs Aero',
            highlight: 'Enterprise stack for .NET',
            ...productAppearances.aero,
        },
        // ONIXPlayer has no page of its own yet: this is published for sharing by hand, worded as its section of /Products is.
        {
            kind: SocialCardKind.Statement,
            path: '/Products/ONIXPlayer',
            alt: 'ONIXPlayer: Entertainment everywhere, with its window showing a visualisation',
            title: 'ONIXPlayer',
            highlight: 'Entertainment everywhere',
            sizes: { title: 66, highlight: 40 },
            ...productAppearances.player,
        },
        {
            kind: SocialCardKind.Statement,
            path: '/Consulting',
            alt: 'ONIXLabs consulting: Expert engineering, from strategy to delivery',
            label: 'Consulting',
            title: 'Expert engineering',
            highlight: 'From strategy to delivery',
            sizes: { title: 66, highlight: 54 },
            colours: spectrum,
            picture: { kind: CardPictureKind.Glass, name: 'rocket' },
        },
        {
            kind: SocialCardKind.Statement,
            path: '/Documentation',
            alt: 'ONIXLabs documentation: Behind the code',
            title: 'Documentation',
            highlight: 'Behind the code',
            colours: spectrum,
            picture: { kind: CardPictureKind.Glass, name: 'documents' },
        },
    ];
}
