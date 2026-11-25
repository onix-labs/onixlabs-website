import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';
import { createImageNode } from './create-image-node';
import { loadCardImage } from './load-card-image';

export async function createImage(source: string, width: number, height: number, style: CardStyle = {}): Promise<CardNode> {
    return createImageNode(await loadCardImage(source, width, height), width, height, style);
}
