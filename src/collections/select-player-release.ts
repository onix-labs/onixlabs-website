import type { GitHubRelease } from './github-release';
import type { GitHubReleaseAsset } from './github-release-asset';
import type { PlayerRelease } from './player-release';

// ONIXPlayer's tags are <year>.<minor>.<patch>; GitHub lists the newest first.
const appTag: RegExp = /^\d+\.\d+\.\d+/u;

export function selectPlayerRelease(releases: ReadonlyArray<GitHubRelease>): PlayerRelease | undefined {
    const release: GitHubRelease | undefined = releases.find((candidate: GitHubRelease): boolean => !candidate.draft && appTag.test(candidate.tagName));

    if (release === undefined) {
        return undefined;
    }

    const version: string = release.tagName;
    const asset: (name: string) => string | undefined = (name: string): string | undefined =>
        release.assets.find((candidate: GitHubReleaseAsset): boolean => candidate.name === name)?.downloadUrl;

    return {
        version,
        pageUrl: release.pageUrl,
        macOSAppleSilicon: asset(`ONIXPlayer-${version}-arm64.dmg`),
        macOSIntel: asset(`ONIXPlayer-${version}.dmg`),
        windows: asset(`ONIXPlayer-Setup-${version}.exe`),
        linux: asset(`ONIXPlayer-${version}.AppImage`),
    };
}
