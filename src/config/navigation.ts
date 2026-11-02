import type { NavigationItem } from './navigation-item';

export const navigation: ReadonlyArray<NavigationItem> = [
    { label: 'Home', path: '/', exact: true },
    { label: 'Products', path: '/Products', exact: false },
    { label: 'Consulting', path: '/Consulting', exact: false },
    { label: 'Documentation', path: '/Documentation', exact: false },
    { label: 'Contact', path: '/Contact', exact: false },
];
