import path from 'node:path';

const contentTypes: ReadonlyMap<string, string> = new Map<string, string>([
    ['.html', 'text/html; charset=utf-8'],
    ['.css', 'text/css; charset=utf-8'],
    ['.js', 'text/javascript; charset=utf-8'],
    ['.svg', 'image/svg+xml'],
    ['.png', 'image/png'],
    ['.jpeg', 'image/jpeg'],
    ['.jpg', 'image/jpeg'],
    ['.webp', 'image/webp'],
    ['.woff2', 'font/woff2'],
    ['.woff', 'font/woff'],
    ['.xml', 'application/xml'],
    ['.txt', 'text/plain; charset=utf-8'],
]);

export function contentTypeFor(filePath: string): string {
    return contentTypes.get(path.extname(filePath).toLowerCase()) ?? 'application/octet-stream';
}
