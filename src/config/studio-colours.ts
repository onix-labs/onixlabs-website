import type { StudioColour } from './studio-colour';

// Every colour a Studio feature can name. Each has a --brand-* or --bs-* token, --ink-* tokens for text, and .label-*,
// .from-* and .to-* classes.
export const studioColours: readonly [StudioColour, ...StudioColour[]] = [
    'amber', 'coral', 'rose', 'violet', 'blue', 'cyan', 'teal', 'green', 'bs-primary', 'bs-success', 'bs-warning', 'bs-danger',
];
