import { detectArchitecture } from './detect-architecture';
import { detectPlatform } from './detect-platform';
import { selectPlatformDownloads } from './select-platform-downloads';
import type { PlatformDownload } from './platform-download';
import type { PlatformInstallers } from './platform-installers';

function apply(link: HTMLAnchorElement, download: PlatformDownload, text: string): void {
    const label: HTMLElement | null = link.querySelector<HTMLElement>('[data-download-label]');

    if (label !== null) {
        link.href = download.url;
        link.setAttribute('aria-label', download.label);
        label.textContent = text;
        link.hidden = false;
    }
}

// Points each [data-platform-download] button at the installer for the visitor's platform and processor. It names the
// platform ("Download for macOS"), with the processor too ("Download for macOS (Intel)") for assistive technology. The
// installer URLs are rendered into its data-download-* attributes at build time. When there's a second installer to
// offer (a Mac whose processor the browser won't reveal), the hidden [data-platform-download-alternate] button beside it
// carries it, and both name their processor instead ("Download (Intel)") so they can be told apart and still fit. Without
// this script, or with no installer to offer, the button keeps its server-rendered link to the release page and reads
// just "Download".
export async function initialisePlatformDownload(): Promise<void> {
    const links: ReadonlyArray<HTMLAnchorElement> = [...document.querySelectorAll<HTMLAnchorElement>('a[data-platform-download]')];
    const platform: 'macos' | 'windows' | 'linux' | undefined = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);

    if (links.length === 0 || platform === undefined) {
        return;
    }

    const architecture: 'arm' | 'x86' | undefined = await detectArchitecture(navigator);

    for (const link of links) {
        const alternate: HTMLAnchorElement | null | undefined = link.parentElement?.querySelector<HTMLAnchorElement>('a[data-platform-download-alternate]');
        const installers: PlatformInstallers = {
            macOSArm: link.dataset['downloadMacosArm'],
            macOSIntel: link.dataset['downloadMacosIntel'],
            windows: link.dataset['downloadWindows'],
            linux: link.dataset['downloadLinux'],
        };
        const [first, second]: ReadonlyArray<PlatformDownload | undefined> = selectPlatformDownloads(platform, architecture, installers);

        if (first !== undefined) {
            apply(link, first, second === undefined ? first.label.replace(/ \(.+\)$/u, '') : first.label.replace(' for macOS', ''));
        }

        if (second !== undefined && alternate !== null && alternate !== undefined) {
            apply(alternate, second, second.label.replace(' for macOS', ''));
        }
    }
}
