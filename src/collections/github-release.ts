import type { GitHubReleaseAsset } from './github-release-asset';

// A GitHub release, as the site reads it.
export interface GitHubRelease {
    readonly tagName: string;
    readonly pageUrl: string;
    readonly draft: boolean;
    readonly assets: ReadonlyArray<GitHubReleaseAsset>;
}
