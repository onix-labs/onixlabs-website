import type { JsonLdValue } from './json-ld-value';

// An interface rather than Record<string, JsonLdValue>: a recursive type alias through Record is rejected as circular.
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface JsonLdObject {
    readonly [key: string]: JsonLdValue;
}
