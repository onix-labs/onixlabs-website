import type { CollectionEntry } from 'astro:content';

import { loadContributors } from '../collections/load-contributors';
import type { ProfileCard } from './profile-card';
import { SocialCardKind } from './social-card-kind';

export async function loadProfileCards(): Promise<ReadonlyArray<ProfileCard>> {
    return (await loadContributors()).map(({ data }: CollectionEntry<'contributors'>): ProfileCard => ({
        kind: SocialCardKind.Profile,
        path: data.path,
        alt: `${data.name}, ${data.jobTitle} at ONIXLabs`,
        givenName: data.givenName,
        familyName: data.familyName,
        jobTitle: data.jobTitle,
        accent: data.accent,
        photo: data.photo,
    }));
}
