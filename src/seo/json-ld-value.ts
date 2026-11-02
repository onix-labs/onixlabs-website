import type { JsonLdObject } from './json-ld-object';

export type JsonLdValue = string | number | boolean | JsonLdObject | ReadonlyArray<JsonLdValue>;
