import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';

export interface CardNodeProps {
    readonly style: CardStyle;
    readonly children?: string | ReadonlyArray<CardNode>;
    readonly src?: string;
    readonly width?: number;
    readonly height?: number;
}
