import { detectArchitecture } from './detect-architecture';
import { detectHandheld } from './detect-handheld';
import { detectPlatform } from './detect-platform';
import { inferMacArchitecture } from './infer-mac-architecture';
import { readGraphics } from './read-graphics';
import { selectPlatformDownload } from './select-platform-download';
import type { PlatformDownload } from './platform-download';
import type { PlatformInstallers } from './platform-installers';

// Points each [data-platform-download] button at the one installer for the visitor's platform and processor. It reads
// just the platform ("Download for macOS"), and names the processor too ("Download for macOS (Intel)") for assistive
// technology. The installer URLs are rendered into its data-download-* attributes at build time. Safari and Firefox
// won't report a Mac's processor, so for them it's judged from the graphics processor. Without this script, or with no
// installer to offer, the button keeps its server-rendered link to the release page and reads just "Download". On a
// phone or tablet, where the apps can't be installed, the buttons are hidden; CSS hides them too on touch-only devices,
// which covers visitors without JavaScript.
export async function initialisePlatformDownload(): Promise<void> {
    const links: ReadonlyArray<HTMLAnchorElement> = [...document.querySelectorAll<HTMLAnchorElement>('a[data-platform-download]')];
    const platform: 'macos' | 'windows' | 'linux' | undefined = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);

    if (detectHandheld(navigator.userAgent, navigator.maxTouchPoints)) {
        for (const link of links) {
            link.hidden = true;
        }

        return;
    }

    if (links.length === 0 || platform === undefined) {
        return;
    }

    const reported: 'arm' | 'x86' | undefined = await detectArchitecture(navigator);
    const architecture: 'arm' | 'x86' | undefined = reported ?? (platform === 'macos' ? inferMacArchitecture(readGraphics()) : undefined);

    for (const link of links) {
        const label: HTMLElement | null = link.querySelector<HTMLElement>('[data-download-label]');
        const installers: PlatformInstallers = {
            macOSArm: link.dataset['downloadMacosArm'],
            macOSIntel: link.dataset['downloadMacosIntel'],
            windows: link.dataset['downloadWindows'],
            linux: link.dataset['downloadLinux'],
        };
        const download: PlatformDownload | undefined = selectPlatformDownload(platform, architecture, installers);

        if (download !== undefined && label !== null) {
            link.href = download.url;
            link.setAttribute('aria-label', download.label);
            label.textContent = download.label.replace(/ \(.+\)$/u, '');
        }
    }
}
