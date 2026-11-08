import { fetchGitHubReleases } from './fetch-github-releases';
import type { PlayerRelease } from './player-release';
import { selectPlayerRelease } from './select-player-release';

let cached: Promise<PlayerRelease | undefined> | undefined;

// Looks up the latest ONIXPlayer release at build time, so the download links stay current with every deploy. A build
// without network access (or rate-limited by GitHub) still succeeds: callers fall back to the releases page.
export async function loadPlayerRelease(): Promise<PlayerRelease | undefined> {
    cached ??= fetchPlayerRelease();
    return cached;
}

async function fetchPlayerRelease(): Promise<PlayerRelease | undefined> {
    try {
        return selectPlayerRelease(await fetchGitHubReleases('onix-labs/onixlabs-media-player'));
    } catch (error: unknown) {
        console.warn(`Couldn't look up the latest ONIXPlayer release; linking to the releases page. ${String(error)}`);
        return undefined;
    }
}
