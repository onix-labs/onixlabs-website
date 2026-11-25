import type { CardNodeProps } from './card-node-props';

// An element of a card, in the shape Satori takes: a React element, without React.
export interface CardNode {
    readonly type: string;
    readonly props: CardNodeProps;
}
