import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';

export function createBox(style: CardStyle, children: ReadonlyArray<CardNode> = []): CardNode {
    return { type: 'div', props: { style: { display: 'flex', ...style }, children } };
}
