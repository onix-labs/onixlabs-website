import { gitHubReleasesSchema } from './github-releases-schema';
import { selectStudioRelease } from './select-studio-release';
import type { StudioRelease } from './studio-release';

const releasesApiUrl: string = 'https://api.github.com/repos/onix-labs/onixlabs-studio/releases?per_page=30';
let cached: Promise<StudioRelease | undefined> | undefined;

// Looks up the latest Studio release at build time, so the download links stay current with every deploy. A build
// without network access (or rate-limited by GitHub) still succeeds: callers fall back to the releases page.
export async function loadStudioRelease(): Promise<StudioRelease | undefined> {
    cached ??= fetchStudioRelease();
    return cached;
}

async function fetchStudioRelease(): Promise<StudioRelease | undefined> {
    const token: string | undefined = process.env['GITHUB_TOKEN'];
    const headers: Record<string, string> = { accept: 'application/vnd.github+json' };

    if (token !== undefined && token !== '') {
        headers['authorization'] = `Bearer ${token}`;
    }

    try {
        const response: Response = await fetch(releasesApiUrl, { headers, signal: AbortSignal.timeout(10_000) });

        if (!response.ok) {
            throw new Error(`GitHub answered ${String(response.status)}`);
        }

        return selectStudioRelease(gitHubReleasesSchema.parse(await response.json()));
    } catch (error: unknown) {
        console.warn(`Couldn't look up the latest ONIXLabs Studio release; linking to the releases page. ${String(error)}`);
        return undefined;
    }
}
