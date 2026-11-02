import { describe, expect, it } from 'vitest';

import { buildJsonLdGraph } from './build-json-ld-graph';

describe('buildJsonLdGraph', (): void => {
    it('wraps the nodes in a schema.org graph', (): void => {
        const json: string = buildJsonLdGraph([{ '@type': 'Thing', name: 'Aero' }]);

        expect(json).toBe('{"@context":"https://schema.org","@graph":[{"@type":"Thing","name":"Aero"}]}');
    });

    it('escapes "<" so content cannot close the script element', (): void => {
        const json: string = buildJsonLdGraph([{ '@type': 'Thing', name: '</script><script>alert(1)</script>' }]);

        expect(json).not.toContain('<');
        expect(json).toContain('\\u003c/script>');
    });
});
