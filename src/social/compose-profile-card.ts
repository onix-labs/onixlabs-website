import { accentInks } from './accent-inks';
import type { CardNode } from './card-node';
import type { CardStyle } from './card-style';
import { cardTheme } from './card-theme';
import type { CardThemeValues } from './card-theme-values';
import { createBloom } from './create-bloom';
import { createBox } from './create-box';
import { createBrandMark } from './create-brand-mark';
import { createPortrait } from './create-portrait';
import { createText } from './create-text';
import type { ProfileCard } from './profile-card';
import { spectrum } from './spectrum';

// A business card: who they are, and their role in their accent colour, beside their portrait, which fades into the bloom.
export async function composeProfileCard(card: ProfileCard): Promise<CardNode> {
    const { width, height, margin, heading, text, muted }: CardThemeValues = cardTheme;
    const name: CardStyle = { fontSize: 80, fontWeight: 600, lineHeight: 1.08, letterSpacing: '-0.035em' };
    const [portrait, brandMark]: [CardNode, CardNode] = await Promise.all([
        createPortrait(card.photo, height, { position: 'absolute', left: width - height, top: 0 }),
        createBrandMark(),
    ]);

    return createBox({ position: 'relative', width, height, fontFamily: 'Poppins' }, [
        createBloom(spectrum),
        portrait,
        createBox({ position: 'absolute', left: margin, top: 128, width: 640, height: 440, flexDirection: 'column', justifyContent: 'center' }, [
            createText(card.givenName, { ...name, color: heading }),
            createText(card.familyName, { ...name, color: muted }),
            createText(card.jobTitle, {
                marginTop: 26, color: accentInks[card.accent], fontFamily: 'JetBrains Mono', fontSize: 26, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase',
            }),
            createText('www.onixlabs.io', { marginTop: 18, color: text, fontSize: 26, fontWeight: 500 }),
        ]),
        brandMark,
    ]);
}
