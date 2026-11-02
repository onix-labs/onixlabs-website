import { Theme } from './theme';
import { themeStorageKey } from './theme-storage-key';

export function readStoredTheme(): Theme | undefined {
    const value: string | null = sessionStorage.getItem(themeStorageKey);

    switch (value) {
        case Theme.Dark:
            return Theme.Dark;
        case Theme.Light:
            return Theme.Light;
        default:
            return undefined;
    }
}
