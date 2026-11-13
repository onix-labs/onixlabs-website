import type { PlatformDownload } from './platform-download';
import type { PlatformInstallers } from './platform-installers';

function toDownload(label: string, url: string | undefined): PlatformDownload | undefined {
    return url === undefined || url === '' ? undefined : { label, url };
}

// Picks the one installer to offer. A Mac whose processor is still unknown gets the Apple silicon build, as every Mac
// sold since 2023 has been; it's never offered the other build in place of a missing one. Windows on ARM runs the x64
// installer under emulation; Linux on ARM can't run the x86_64 AppImage, so it gets nothing. Undefined leaves the
// button on the release page.
export function selectPlatformDownload(
    platform: 'macos' | 'windows' | 'linux',
    architecture: 'arm' | 'x86' | undefined,
    installers: PlatformInstallers,
): PlatformDownload | undefined {
    switch (platform) {
        case 'macos':
            return architecture === 'x86'
                ? toDownload('Download for macOS (Intel)', installers.macOSIntel)
                : toDownload('Download for macOS (Apple silicon)', installers.macOSArm);
        case 'windows':
            return toDownload('Download for Windows', installers.windows);
        case 'linux':
            return architecture === 'arm' ? undefined : toDownload('Download for Linux', installers.linux);
    }
}
