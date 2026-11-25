import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';

export function createText(text: string, style: CardStyle): CardNode {
    return { type: 'div', props: { style: { display: 'block', ...style }, children: text } };
}
