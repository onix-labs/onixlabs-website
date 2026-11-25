import type { BrandColour } from './brand-colour';
import type { LibraryFamily } from './library-family';

// Each library family's pair of colours, as the --family-* tokens have them.
export const familyColours: Readonly<Record<LibraryFamily, ReadonlyArray<BrandColour>>> = {
    dotnet: ['violet', 'blue'],
    corda: ['coral', 'rose'],
    kotlin: ['blue', 'cyan'],
};
