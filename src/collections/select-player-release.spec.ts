import { describe, expect, it } from 'vitest';

import { selectPlayerRelease } from './select-player-release';
import type { PlayerRelease } from './player-release';

const base: string = 'https://github.com/onix-labs/onixlabs-media-player/releases';

describe('selectPlayerRelease', (): void => {
    it('skips drafts and picks each platform’s installer', (): void => {
        const release: PlayerRelease | undefined = selectPlayerRelease([
            { tagName: '2026.11.0', pageUrl: `${base}/tag/2026.11.0`, draft: true, assets: [] },
            {
                tagName: '2026.10.0',
                pageUrl: `${base}/tag/2026.10.0`,
                draft: false,
                assets: [
                    { name: 'latest-mac.yml', downloadUrl: `${base}/download/latest-mac.yml` },
                    { name: 'ONIXPlayer-2026.10.0-arm64-mac.zip', downloadUrl: `${base}/download/arm64.zip` },
                    { name: 'ONIXPlayer-2026.10.0-arm64.dmg', downloadUrl: `${base}/download/arm64.dmg` },
                    { name: 'ONIXPlayer-2026.10.0-arm64.dmg.blockmap', downloadUrl: `${base}/download/arm64.blockmap` },
                    { name: 'ONIXPlayer-2026.10.0.AppImage', downloadUrl: `${base}/download/linux.AppImage` },
                    { name: 'ONIXPlayer-2026.10.0.dmg', downloadUrl: `${base}/download/intel.dmg` },
                    { name: 'ONIXPlayer-2026.10.0.exe', downloadUrl: `${base}/download/portable.exe` },
                    { name: 'ONIXPlayer-Setup-2026.10.0.exe', downloadUrl: `${base}/download/setup.exe` },
                ],
            },
        ]);

        expect(release).toEqual({
            version: '2026.10.0',
            pageUrl: `${base}/tag/2026.10.0`,
            macOSAppleSilicon: `${base}/download/arm64.dmg`,
            macOSIntel: `${base}/download/intel.dmg`,
            windows: `${base}/download/setup.exe`,
            linux: `${base}/download/linux.AppImage`,
        });
    });

    it('leaves a platform undefined when the release lacks its installer', (): void => {
        const release: PlayerRelease | undefined = selectPlayerRelease([{ tagName: '2026.10.0', pageUrl: `${base}/tag/2026.10.0`, draft: false, assets: [] }]);

        expect(release?.windows).toBeUndefined();
    });

    it('returns undefined when there is no app release', (): void => {
        expect(selectPlayerRelease([{ tagName: 'nightly', pageUrl: `${base}/tag/nightly`, draft: false, assets: [] }])).toBeUndefined();
    });
});
