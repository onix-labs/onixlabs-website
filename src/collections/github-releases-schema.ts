/* eslint-disable @typescript-eslint/naming-convention -- the keys are GitHub's API field names. */
import { z } from 'astro/zod';

import type { GitHubRelease } from './github-release';

// The parts of GitHub's "list releases" response the site reads, renamed to camelCase.
export const gitHubReleasesSchema: z.ZodType<ReadonlyArray<GitHubRelease>> = z.array(z.object({
    tag_name: z.string(),
    html_url: z.url(),
    draft: z.boolean(),
    assets: z.array(z.object({
        name: z.string(),
        browser_download_url: z.url(),
    })),
}).transform((release: { tag_name: string; html_url: string; draft: boolean; assets: { name: string; browser_download_url: string }[] }): GitHubRelease => ({
    tagName: release.tag_name,
    pageUrl: release.html_url,
    draft: release.draft,
    assets: release.assets.map((asset: { name: string; browser_download_url: string }) => ({ name: asset.name, downloadUrl: asset.browser_download_url })),
})));
