import { applyTheme } from './apply-theme';
import { readStoredTheme } from './read-stored-theme';
import { Theme } from './theme';
import { themeStorageKey } from './theme-storage-key';

// The initial theme is applied before first paint by ThemeInitialiser.astro; this wires up the switch
// and follows OS changes until the visitor picks a theme explicitly.
export function initialiseThemeToggle(): void {
    const toggleElement: HTMLElement | null = document.getElementById('theme-toggle');
    const toggle: HTMLElement | undefined = toggleElement ?? undefined;
    const darkQuery: MediaQueryList = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme: Theme = document.documentElement.getAttribute('data-bs-theme') === Theme.Dark ? Theme.Dark : Theme.Light;

    applyTheme(currentTheme, toggle);

    toggle?.addEventListener('click', (): void => {
        const nextTheme: Theme = toggle.getAttribute('aria-checked') === 'true' ? Theme.Light : Theme.Dark;
        sessionStorage.setItem(themeStorageKey, nextTheme);
        applyTheme(nextTheme, toggle);
    });

    darkQuery.addEventListener('change', (event: MediaQueryListEvent): void => {
        if (readStoredTheme() === undefined) {
            applyTheme(event.matches ? Theme.Dark : Theme.Light, toggle);
        }
    });
}
