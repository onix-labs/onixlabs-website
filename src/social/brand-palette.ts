import type { BrandColour } from './brand-colour';

// The brand colours of tokens.css, for images, which can't read CSS variables. brand-palette.spec.ts keeps them the same.
export const brandPalette: Readonly<Record<BrandColour, string>> = {
    amber: '#F79533',
    coral: '#F37055',
    rose: '#EF4E7B',
    violet: '#A166AB',
    blue: '#5073B8',
    cyan: '#1098AD',
    teal: '#07B39B',
    green: '#6FBA82',
};
