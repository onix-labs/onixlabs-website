import type { GitHubRelease } from './github-release';
import type { GitHubReleaseAsset } from './github-release-asset';
import type { StudioRelease } from './studio-release';

// The Studio repository also publishes plugin releases (plugin-<name>-v<version>); the app's own tags are
// v<year>.<minor>.<patch>[-<pre-release>]. GitHub lists the newest first.
const appTag: RegExp = /^v\d+\.\d+\.\d+/u;

export function selectStudioRelease(releases: ReadonlyArray<GitHubRelease>): StudioRelease | undefined {
    const release: GitHubRelease | undefined = releases.find((candidate: GitHubRelease): boolean => !candidate.draft && appTag.test(candidate.tagName));

    if (release === undefined) {
        return undefined;
    }

    const asset: (suffix: string) => string | undefined = (suffix: string): string | undefined =>
        release.assets.find((candidate: GitHubReleaseAsset): boolean => candidate.name.endsWith(suffix))?.downloadUrl;

    return {
        version: release.tagName.slice(1),
        pageUrl: release.pageUrl,
        macOSAppleSilicon: asset('-mac-arm64.dmg'),
        macOSIntel: asset('-mac-x64.dmg'),
        windows: asset('-win-x64.exe'),
        linux: asset('-linux-x86_64.AppImage'),
    };
}
