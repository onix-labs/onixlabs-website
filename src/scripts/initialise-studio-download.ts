import { detectPlatform } from './detect-platform';

const names: Readonly<Record<string, string>> = { macos: 'macOS', windows: 'Windows', linux: 'Linux' };

// Points each [data-studio-download] button at the installer for the visitor's platform and names it ("Download for
// macOS"). The installer URLs are rendered into data-download-<platform> attributes at build time; without this
// script, or on a platform with no installer, the button keeps its server-rendered link to the release page. Macs
// get the Apple silicon build: browsers don't reveal a Mac's processor.
export function initialiseStudioDownload(): void {
    const platform: string | undefined = detectPlatform(navigator.userAgent, navigator.maxTouchPoints);

    if (platform === undefined) {
        return;
    }

    document.querySelectorAll<HTMLAnchorElement>('a[data-studio-download]').forEach((link: HTMLAnchorElement): void => {
        const url: string | undefined = link.dataset[`download${platform.charAt(0).toUpperCase()}${platform.slice(1)}`];
        const label: HTMLElement | null = link.querySelector<HTMLElement>('[data-download-label]');

        if (url === undefined || url === '' || label === null) {
            return;
        }

        link.href = url;
        label.textContent = `Download for ${names[platform] ?? platform}`;
    });
}
