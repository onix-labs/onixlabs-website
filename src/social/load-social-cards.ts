import type { SocialCard } from './social-card';
import { buildPageCards } from './build-page-cards';
import { loadArticleCards } from './load-article-cards';
import { loadLibraryCards } from './load-library-cards';
import { loadProfileCards } from './load-profile-cards';

// Every card. Content gets its own, so a new product, article or contributor needs nothing more.
export async function loadSocialCards(): Promise<ReadonlyArray<SocialCard>> {
    return [...buildPageCards(), ...await loadLibraryCards(), ...await loadArticleCards(), ...await loadProfileCards()];
}
