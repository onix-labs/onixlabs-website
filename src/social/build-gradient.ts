import type { BrandColour } from './brand-colour';
import { brandPalette } from './brand-palette';

export function buildGradient(colours: ReadonlyArray<BrandColour>): string {
    return `linear-gradient(90deg, ${colours.map((colour: BrandColour): string => brandPalette[colour]).join(', ')})`;
}
