import { describe, expect, it } from 'vitest';

import { selectPlatformDownload } from './select-platform-download';
import type { PlatformInstallers } from './platform-installers';

const installers: PlatformInstallers = { macOSArm: 'arm.dmg', macOSIntel: 'x64.dmg', windows: 'win.exe', linux: 'linux.AppImage' };
const appleSilicon: { label: string; url: string } = { label: 'Download for macOS (Apple silicon)', url: 'arm.dmg' };
const intel: { label: string; url: string } = { label: 'Download for macOS (Intel)', url: 'x64.dmg' };

describe('selectPlatformDownload', (): void => {
    it('offers a Mac the build for its processor', (): void => {
        expect(selectPlatformDownload('macos', 'arm', installers)).toEqual(appleSilicon);
        expect(selectPlatformDownload('macos', 'x86', installers)).toEqual(intel);
    });

    it('offers a Mac whose processor is unknown the Apple silicon build alone', (): void => {
        expect(selectPlatformDownload('macos', undefined, installers)).toEqual(appleSilicon);
    });

    it('never substitutes the other Mac build when one is missing', (): void => {
        expect(selectPlatformDownload('macos', 'x86', { ...installers, macOSIntel: undefined })).toBeUndefined();
        expect(selectPlatformDownload('macos', 'arm', { ...installers, macOSArm: '' })).toBeUndefined();
        expect(selectPlatformDownload('macos', undefined, { ...installers, macOSArm: undefined })).toBeUndefined();
    });

    it('offers Windows its installer on either processor', (): void => {
        const windows: { label: string; url: string } = { label: 'Download for Windows', url: 'win.exe' };

        expect(selectPlatformDownload('windows', 'x86', installers)).toEqual(windows);
        expect(selectPlatformDownload('windows', 'arm', installers)).toEqual(windows);
    });

    it('offers Linux the AppImage, except on ARM, which it can’t run on', (): void => {
        expect(selectPlatformDownload('linux', undefined, installers)).toEqual({ label: 'Download for Linux', url: 'linux.AppImage' });
        expect(selectPlatformDownload('linux', 'arm', installers)).toBeUndefined();
    });
});
