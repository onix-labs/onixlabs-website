import { fetchGitHubReleases } from './fetch-github-releases';
import { selectStudioRelease } from './select-studio-release';
import type { StudioRelease } from './studio-release';

let cached: Promise<StudioRelease | undefined> | undefined;

// Looks up the latest Studio release at build time, so the download links stay current with every deploy. A build
// without network access (or rate-limited by GitHub) still succeeds: callers fall back to the releases page.
export async function loadStudioRelease(): Promise<StudioRelease | undefined> {
    cached ??= fetchStudioRelease();
    return cached;
}

async function fetchStudioRelease(): Promise<StudioRelease | undefined> {
    try {
        return selectStudioRelease(await fetchGitHubReleases('onix-labs/onixlabs-studio'));
    } catch (error: unknown) {
        console.warn(`Couldn't look up the latest ONIXLabs Studio release; linking to the releases page. ${String(error)}`);
        return undefined;
    }
}
