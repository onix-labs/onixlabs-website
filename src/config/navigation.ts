import type { NavigationItem } from './navigation-item';

export const navigation: ReadonlyArray<NavigationItem> = [
    { label: 'Home', path: '/archive', exact: true },
    { label: 'Products', path: '/archive/Products', exact: false },
    { label: 'Consulting', path: '/archive/Consulting', exact: false },
    { label: 'Documentation', path: '/archive/Documentation', exact: false },
    { label: 'Contact', path: '/archive/Contact', exact: false },
];
