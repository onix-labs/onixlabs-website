// Turns each server-rendered [data-tabs] block into an ARIA tabs widget: reveals the tab strip, labels and hides the
// panels, and wires up clicks and the arrow, Home and End keys (with automatic activation). Without it, every panel
// stays visible one after another under its own heading, so no content depends on this script.
const keys: ReadonlyArray<string> = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];

export function initialiseTabs(): void {
    document.querySelectorAll<HTMLElement>('[data-tabs]:not(.is-enhanced)').forEach((root: HTMLElement): void => {
        enhance(root);
    });
}

function enhance(root: HTMLElement): void {
    const list: HTMLElement | null = root.querySelector<HTMLElement>(':scope > [role="tablist"]');

    if (list === null) {
        return;
    }

    const tabs: ReadonlyArray<HTMLButtonElement> = Array.from(list.querySelectorAll<HTMLButtonElement>(':scope > [role="tab"]'));
    const initial: HTMLButtonElement | undefined = tabs.find((tab: HTMLButtonElement): boolean => tab.getAttribute('aria-selected') === 'true') ?? tabs[0];

    if (initial === undefined) {
        return;
    }

    tabs.forEach((tab: HTMLButtonElement): void => {
        const panel: HTMLElement | null = panelFor(tab);
        panel?.setAttribute('role', 'tabpanel');
        panel?.setAttribute('aria-labelledby', tab.id);
        panel?.setAttribute('tabindex', '0');

        tab.addEventListener('click', (): void => {
            select(tabs, tab);
        });
    });

    list.addEventListener('keydown', (event: KeyboardEvent): void => {
        if (!keys.includes(event.key) || !(event.target instanceof HTMLButtonElement)) {
            return;
        }

        const current: number = tabs.indexOf(event.target);
        const next: HTMLButtonElement | undefined = tabs[nextIndex(event.key, current, tabs.length)];

        if (current === -1 || next === undefined) {
            return;
        }

        event.preventDefault();
        select(tabs, next);
        next.focus();
    });

    select(tabs, initial);
    list.hidden = false;
    root.classList.add('is-enhanced');
}

function nextIndex(key: string, current: number, count: number): number {
    switch (key) {
        case 'Home':
            return 0;
        case 'End':
            return count - 1;
        case 'ArrowLeft':
            return (current - 1 + count) % count;
        default:
            return (current + 1) % count;
    }
}

function select(tabs: ReadonlyArray<HTMLButtonElement>, selected: HTMLButtonElement): void {
    tabs.forEach((tab: HTMLButtonElement): void => {
        const isSelected: boolean = tab === selected;
        tab.setAttribute('aria-selected', String(isSelected));
        tab.tabIndex = isSelected ? 0 : -1;

        const panel: HTMLElement | null = panelFor(tab);

        if (panel !== null) {
            panel.hidden = !isSelected;
        }
    });
}

function panelFor(tab: HTMLButtonElement): HTMLElement | null {
    const id: string | null = tab.getAttribute('aria-controls');
    return id === null ? null : document.getElementById(id);
}
