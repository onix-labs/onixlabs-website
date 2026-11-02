import { stat } from 'node:fs/promises';
import path from 'node:path';

import type { ResolvedFile } from './resolved-file';

const distDirectory: string = path.resolve('dist');

async function isFile(candidate: string): Promise<boolean> {
    try {
        return (await stat(candidate)).isFile();
    } catch (error: unknown) {
        if (error instanceof Error && 'code' in error && error.code === 'ENOENT') {
            return false;
        }

        throw error;
    }
}

// Mirrors GitHub Pages: an exact file, then "<path>.html", then "<path>/index.html"; otherwise 404.html.
// Paths are case-sensitive, as they are on Pages.
export async function resolveDistFile(urlPath: string): Promise<ResolvedFile> {
    const decoded: string = decodeURIComponent(urlPath);
    const relative: string = path.normalize(decoded).replace(/^(\.\.(\/|\\|$))+/, '');
    const base: string = path.join(distDirectory, relative);
    const candidates: ReadonlyArray<string> = [base, `${base}.html`, path.join(base, 'index.html')];

    for (const candidate of candidates) {
        if (candidate.startsWith(distDirectory) && await isFile(candidate)) {
            return { filePath: candidate, status: 200 };
        }
    }

    return { filePath: path.join(distDirectory, '404.html'), status: 404 };
}
