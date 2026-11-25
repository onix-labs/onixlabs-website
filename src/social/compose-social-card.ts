import type { CardNode } from './card-node';
import { composeProfileCard } from './compose-profile-card';
import { composeStatementCard } from './compose-statement-card';
import type { SocialCard } from './social-card';
import { SocialCardKind } from './social-card-kind';

export async function composeSocialCard(card: SocialCard): Promise<CardNode> {
    return card.kind === SocialCardKind.Profile ? await composeProfileCard(card) : await composeStatementCard(card);
}
