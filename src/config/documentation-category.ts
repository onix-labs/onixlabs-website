import type { BrandColour } from '../social/brand-colour';

// A group of articles on /Documentation: its name, the two-part headline of its band on the hub, and what it's for. Its
// articles' social cards show a glass icon (in public/onixlabs/images/icons/glass) and bloom in its colours.
export interface DocumentationCategory {
    readonly id: string;
    readonly name: string;
    readonly title: string;
    readonly highlight: string;
    readonly lead: string;
    readonly cardGlass: string;
    readonly cardColours: ReadonlyArray<BrandColour>;
}
