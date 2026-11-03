import { Theme } from './theme';

export function applyTheme(theme: Theme, toggle: HTMLElement | undefined): void {
    document.documentElement.setAttribute('data-theme', theme);
    toggle?.setAttribute('aria-checked', String(theme === Theme.Dark));
}
