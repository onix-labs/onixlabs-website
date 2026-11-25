import type { ProfileAccent } from './profile-accent';

// Each contributor's accent as text on a raised surface: the dark theme's --accent-ink in base.css, worked out. AA.
export const accentInks: Readonly<Record<ProfileAccent, string>> = {
    blue: '#8fa5d2',
    rose: '#f483a3',
    coral: '#f5846d',
    teal: '#16b8a1',
};
