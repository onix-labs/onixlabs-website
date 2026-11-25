import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';
import { cardTheme } from './card-theme';
import type { CardThemeValues } from './card-theme-values';
import { chooseTitleSize } from './choose-title-size';
import { composePicture } from './compose-picture';
import { createBloom } from './create-bloom';
import { createBox } from './create-box';
import { createBrandMark } from './create-brand-mark';
import { createGradientText } from './create-gradient-text';
import { createText } from './create-text';
import type { HeadlineSizes } from './headline-sizes';
import type { StatementCard } from './statement-card';

export async function composeStatementCard(card: StatementCard): Promise<CardNode> {
    const { width, height, margin, heading, text, muted }: CardThemeValues = cardTheme;
    const size: number = chooseTitleSize(card.title + (card.highlight ?? ''));
    const sizes: HeadlineSizes = card.sizes ?? { title: size, highlight: size };
    const headline: CardStyle = {
        fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.035em', ...(card.sizes === undefined ? { textWrap: 'balance' } : { whiteSpace: 'nowrap' }),
    };
    const [picture, brandMark]: [CardNode, CardNode] = await Promise.all([composePicture(card.picture), createBrandMark()]);
    const copy: ReadonlyArray<CardNode> = [
        ...(card.label === undefined ? [] : [createText(card.label, {
            marginBottom: 20, color: muted, fontFamily: 'JetBrains Mono', fontSize: 22, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
        })]),
        createText(card.title, { ...headline, fontSize: sizes.title, color: heading }),
        ...(card.highlight === undefined ? [] : [createGradientText(card.highlight, card.colours, { ...headline, fontSize: sizes.highlight, paddingBottom: sizes.highlight * 0.2 })]),
        ...(card.lead === undefined ? [] : [createText(card.lead, {
            marginTop: 22, color: text, fontSize: 30, fontWeight: 500, lineHeight: 1.35, letterSpacing: '-0.014em', textWrap: 'balance',
        })]),
    ];

    return createBox({ position: 'relative', width, height, fontFamily: 'Poppins' }, [
        createBloom(card.colours),
        picture,
        createBox({ position: 'absolute', left: margin, top: 128, width: 580, height: 440, flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }, copy),
        brandMark,
    ]);
}
