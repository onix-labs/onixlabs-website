import type { JsonLdValue } from './json-ld-value';

export interface JsonLdObject {
    readonly [key: string]: JsonLdValue;
}
