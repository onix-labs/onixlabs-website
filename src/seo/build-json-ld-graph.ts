import type { JsonLdObject } from './json-ld-object';

// Escapes "<" so content can never close the surrounding <script> element.
export function buildJsonLdGraph(nodes: ReadonlyArray<JsonLdObject>): string {
    const graph: JsonLdObject = { '@context': 'https://schema.org', '@graph': nodes };
    return JSON.stringify(graph).replace(/</g, '\\u003c');
}
