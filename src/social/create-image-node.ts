import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';

// A PNG as an element, embedded in the card.
export function createImageNode(image: Buffer, width: number, height: number, style: CardStyle): CardNode {
    return { type: 'img', props: { src: `data:image/png;base64,${image.toString('base64')}`, width, height, style: { width, height, ...style } } };
}
