import type { BrandColour } from './brand-colour';
import { buildGradient } from './build-gradient';
import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';
import { createText } from './create-text';

// Text in the brand's colours, as .gradient-text has it.
export function createGradientText(text: string, colours: ReadonlyArray<BrandColour>, style: CardStyle): CardNode {
    return createText(text, { ...style, color: 'transparent', backgroundImage: buildGradient(colours), backgroundClip: 'text' });
}
