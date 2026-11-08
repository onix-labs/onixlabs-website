import type { PlatformDownload } from './platform-download';
import type { PlatformInstallers } from './platform-installers';

function toDownloads(...candidates: ReadonlyArray<readonly [string, string | undefined]>): ReadonlyArray<PlatformDownload> {
    return candidates.flatMap(([label, url]: readonly [string, string | undefined]): ReadonlyArray<PlatformDownload> =>
        url === undefined || url === '' ? [] : [{ label, url }]);
}

// Picks the installers to offer. A Mac whose processor is unknown gets one per processor, named, because neither guess
// is safe. Windows on ARM runs the x64 installer under emulation; Linux on ARM can't run the x86_64 AppImage, so it
// gets nothing. An empty result leaves the button on the release page.
export function selectPlatformDownloads(
    platform: 'macos' | 'windows' | 'linux',
    architecture: 'arm' | 'x86' | undefined,
    installers: PlatformInstallers,
): ReadonlyArray<PlatformDownload> {
    const macOSArm: readonly [string, string | undefined] = ['Download for macOS (Apple silicon)', installers.macOSArm];
    const macOSIntel: readonly [string, string | undefined] = ['Download for macOS (Intel)', installers.macOSIntel];

    switch (platform) {
        case 'macos':
            if (architecture === 'arm') {
                return toDownloads(macOSArm);
            }

            return architecture === 'x86' ? toDownloads(macOSIntel) : toDownloads(macOSArm, macOSIntel);
        case 'windows':
            return toDownloads(['Download for Windows', installers.windows]);
        case 'linux':
            return architecture === 'arm' ? [] : toDownloads(['Download for Linux', installers.linux]);
    }
}
