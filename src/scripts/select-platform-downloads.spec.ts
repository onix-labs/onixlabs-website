import { describe, expect, it } from 'vitest';

import { selectPlatformDownloads } from './select-platform-downloads';
import type { PlatformInstallers } from './platform-installers';

const installers: PlatformInstallers = { macOSArm: 'arm.dmg', macOSIntel: 'x64.dmg', windows: 'win.exe', linux: 'linux.AppImage' };
const appleSilicon: { label: string; url: string } = { label: 'Download for macOS (Apple silicon)', url: 'arm.dmg' };
const intel: { label: string; url: string } = { label: 'Download for macOS (Intel)', url: 'x64.dmg' };

describe('selectPlatformDownloads', (): void => {
    it('offers a Mac the build for its processor', (): void => {
        expect(selectPlatformDownloads('macos', 'arm', installers)).toEqual([appleSilicon]);
        expect(selectPlatformDownloads('macos', 'x86', installers)).toEqual([intel]);
    });

    it('offers both Mac builds when the processor is unknown', (): void => {
        expect(selectPlatformDownloads('macos', undefined, installers)).toEqual([appleSilicon, intel]);
    });

    it('never substitutes the other Mac build when one is missing', (): void => {
        expect(selectPlatformDownloads('macos', 'x86', { ...installers, macOSIntel: undefined })).toEqual([]);
        expect(selectPlatformDownloads('macos', undefined, { ...installers, macOSIntel: '' })).toEqual([appleSilicon]);
    });

    it('offers Windows its installer on either processor', (): void => {
        const windows: { label: string; url: string } = { label: 'Download for Windows', url: 'win.exe' };

        expect(selectPlatformDownloads('windows', 'x86', installers)).toEqual([windows]);
        expect(selectPlatformDownloads('windows', 'arm', installers)).toEqual([windows]);
    });

    it('offers Linux the AppImage, except on ARM, which it can’t run on', (): void => {
        expect(selectPlatformDownloads('linux', undefined, installers)).toEqual([{ label: 'Download for Linux', url: 'linux.AppImage' }]);
        expect(selectPlatformDownloads('linux', 'arm', installers)).toEqual([]);
    });
});
