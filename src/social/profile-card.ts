import type { ProfileAccent } from './profile-accent';
import type { SocialCardKind } from './social-card-kind';

// A contributor's business card. `path` is their profile, and `alt` describes the card.
export interface ProfileCard {
    readonly kind: SocialCardKind.Profile;
    readonly path: string;
    readonly alt: string;
    readonly givenName: string;
    readonly familyName: string;
    readonly jobTitle: string;
    readonly accent: ProfileAccent;
    readonly photo: string;
}
