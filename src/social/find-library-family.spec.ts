import { describe, expect, it } from 'vitest';

import { findLibraryFamily } from './find-library-family';

describe('findLibraryFamily', (): void => {
    it('finds a family by its id', (): void => {
        expect(findLibraryFamily('corda')).toBe('corda');
    });

    it('rejects a family it has no colours for', (): void => {
        expect((): string => findLibraryFamily('fortran')).toThrow('fortran');
    });
});
