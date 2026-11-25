import type { BrandColour } from './brand-colour';
import { buildGradient } from './build-gradient';
import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';
import { cardTheme } from './card-theme';
import type { CardThemeValues } from './card-theme-values';
import { createBox } from './create-box';

// The hero bloom: the colours along the bottom, melting upwards into the page's grey with the curve .hero-bloom has.
export function createBloom(colours: ReadonlyArray<BrandColour>): CardNode {
    const { background, width, height }: CardThemeValues = cardTheme;
    const bloomHeight: number = Math.round(height * 0.66);
    const fade: string = [[100, 0], [96, 22], [90, 39], [80, 56], [63, 72], [45, 83], [18, 95], [0, 100]]
        .map(([opacity, position]: ReadonlyArray<number>): string => `rgba(33, 37, 41, ${String((opacity ?? 0) / 100)}) ${String(position)}%`)
        .join(', ');
    const layer: CardStyle = { position: 'absolute', left: 0, top: height - bloomHeight, width, height: bloomHeight };

    return createBox({ position: 'absolute', left: 0, top: 0, width, height, backgroundColor: background }, [
        createBox({ ...layer, backgroundImage: buildGradient(colours) }),
        createBox({ ...layer, backgroundImage: `linear-gradient(180deg, ${fade})` }),
    ]);
}
