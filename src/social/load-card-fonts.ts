import { readFile } from 'node:fs/promises';
import path from 'node:path';

import type { Font } from 'satori';

// The site's fonts as WOFF: Satori can't read the WOFF2 the pages use.
export async function loadCardFonts(): Promise<Font[]> {
    const fonts: string = path.resolve('node_modules/@fontsource');

    return await Promise.all([
        loadFont('Poppins', 500, path.join(fonts, 'poppins/files/poppins-latin-500-normal.woff')),
        loadFont('Poppins', 600, path.join(fonts, 'poppins/files/poppins-latin-600-normal.woff')),
        loadFont('JetBrains Mono', 600, path.join(fonts, 'jetbrains-mono/files/jetbrains-mono-latin-600-normal.woff')),
    ]);
}

async function loadFont(name: string, weight: 500 | 600, file: string): Promise<Font> {
    return { name, weight, style: 'normal', data: await readFile(file) };
}
