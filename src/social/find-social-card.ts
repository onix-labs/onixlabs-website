import { homeCard } from './home-card';
import { loadSocialCards } from './load-social-cards';
import type { SocialCard } from './social-card';

// The card for a page: its own, or the home page's.
export async function findSocialCard(pagePath: string): Promise<SocialCard> {
    return (await loadSocialCards()).find((card: SocialCard): boolean => card.path === pagePath) ?? homeCard;
}
