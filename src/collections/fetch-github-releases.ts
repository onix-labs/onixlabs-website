import { gitHubReleasesSchema } from './github-releases-schema';
import type { GitHubRelease } from './github-release';

// Reads a repository's newest releases from GitHub. Throws if GitHub can't be reached or refuses, so callers can fall
// back to the releases page: a build without network access, or rate-limited by GitHub, must still succeed.
export async function fetchGitHubReleases(repository: string): Promise<ReadonlyArray<GitHubRelease>> {
    const token: string | undefined = process.env['GITHUB_TOKEN'];
    const headers: Record<string, string> = { accept: 'application/vnd.github+json' };

    if (token !== undefined && token !== '') {
        headers['authorization'] = `Bearer ${token}`;
    }

    const response: Response = await fetch(`https://api.github.com/repos/${repository}/releases?per_page=30`, { headers, signal: AbortSignal.timeout(10_000) });

    if (!response.ok) {
        throw new Error(`GitHub answered ${String(response.status)}`);
    }

    return gitHubReleasesSchema.parse(await response.json());
}
