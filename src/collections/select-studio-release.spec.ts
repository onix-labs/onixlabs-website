import { describe, expect, it } from 'vitest';

import { selectStudioRelease } from './select-studio-release';
import type { StudioRelease } from './studio-release';

const base: string = 'https://github.com/onix-labs/onixlabs-studio/releases';

describe('selectStudioRelease', (): void => {
    it('skips plugin releases and drafts, and picks each platform’s installer', (): void => {
        const release: StudioRelease | undefined = selectStudioRelease([
            { tagName: 'plugin-sqlite-engine-v1.2.0', pageUrl: `${base}/tag/plugin-sqlite-engine-v1.2.0`, draft: false, assets: [] },
            { tagName: 'v2026.1.0-beta.10', pageUrl: `${base}/tag/v2026.1.0-beta.10`, draft: true, assets: [] },
            {
                tagName: 'v2026.1.0-beta.9',
                pageUrl: `${base}/tag/v2026.1.0-beta.9`,
                draft: false,
                assets: [
                    { name: 'onixlabs-studio-2026.1.0-beta.9-linux-x86_64.AppImage', downloadUrl: `${base}/download/linux.AppImage` },
                    { name: 'onixlabs-studio-2026.1.0-beta.9-mac-arm64.dmg', downloadUrl: `${base}/download/arm64.dmg` },
                    { name: 'onixlabs-studio-2026.1.0-beta.9-mac-arm64.zip', downloadUrl: `${base}/download/arm64.zip` },
                    { name: 'onixlabs-studio-2026.1.0-beta.9-mac-x64.dmg', downloadUrl: `${base}/download/x64.dmg` },
                    { name: 'onixlabs-studio-2026.1.0-beta.9-win-x64.exe', downloadUrl: `${base}/download/win.exe` },
                ],
            },
        ]);

        expect(release).toEqual({
            version: '2026.1.0-beta.9',
            pageUrl: `${base}/tag/v2026.1.0-beta.9`,
            macOSAppleSilicon: `${base}/download/arm64.dmg`,
            macOSIntel: `${base}/download/x64.dmg`,
            windows: `${base}/download/win.exe`,
            linux: `${base}/download/linux.AppImage`,
        });
    });

    it('returns undefined when there is no app release', (): void => {
        expect(selectStudioRelease([{ tagName: 'plugin-x-v1.0.0', pageUrl: `${base}/tag/plugin-x-v1.0.0`, draft: false, assets: [] }])).toBeUndefined();
    });
});
