import type { NavigationItem } from './navigation-item';

export function isCurrentPath(item: NavigationItem, currentPath: string): boolean {
    const normalisedPath: string = currentPath.replace(/\.html$/, '').replace(/(.)\/$/, '$1');
    return item.exact ? normalisedPath === item.path : normalisedPath === item.path || normalisedPath.startsWith(`${item.path}/`);
}
