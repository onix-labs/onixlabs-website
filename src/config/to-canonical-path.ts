import { sectionPaths } from './section-paths';

export function toCanonicalPath(path: string): string {
    return sectionPaths.includes(path) ? `${path}/` : path;
}
