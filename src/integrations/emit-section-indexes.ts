import { copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

import type { AstroIntegration } from 'astro';

import { sectionPaths } from '../config/section-paths';

// Copies each section page (Products.html) to Products/index.html; see src/config/section-paths.ts.
export function emitSectionIndexes(): AstroIntegration {
    return {
        name: 'emit-section-indexes',
        hooks: {
            'astro:build:done': async ({ dir }: { readonly dir: URL }): Promise<void> => {
                const outputDirectory: string = fileURLToPath(dir);
                await Promise.all(sectionPaths.map(async (sectionPath: string): Promise<void> => {
                    await copyFile(`${outputDirectory}${sectionPath.slice(1)}.html`, `${outputDirectory}${sectionPath.slice(1)}/index.html`);
                }));
            },
        },
    };
}
