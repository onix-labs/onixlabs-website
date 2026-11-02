import { describe, expect, it } from 'vitest';

import { splitParagraphs } from './split-paragraphs';

describe('splitParagraphs', (): void => {
    it('splits on blank lines and trims each paragraph', (): void => {
        const paragraphs: ReadonlyArray<string> = splitParagraphs('First paragraph.\n\n  Second paragraph.  \n');

        expect(paragraphs).toEqual(['First paragraph.', 'Second paragraph.']);
    });

    it('returns a single paragraph when there are no breaks', (): void => {
        const paragraphs: ReadonlyArray<string> = splitParagraphs('Only one.');

        expect(paragraphs).toEqual(['Only one.']);
    });
});
