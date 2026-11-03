// Moves the light inside .spotlight elements to follow the pointer. Purely decorative: cards look complete without it.
export function initialiseSpotlight(): void {
    if (!window.matchMedia('(hover: hover) and (prefers-reduced-motion: no-preference)').matches) {
        return;
    }

    document.addEventListener('pointermove', (event: PointerEvent): void => {
        if (!(event.target instanceof Element)) {
            return;
        }

        const card: HTMLElement | null = event.target.closest<HTMLElement>('.spotlight');

        if (card === null) {
            return;
        }

        const bounds: DOMRect = card.getBoundingClientRect();
        card.style.setProperty('--pointer-x', `${String(event.clientX - bounds.left)}px`);
        card.style.setProperty('--pointer-y', `${String(event.clientY - bounds.top)}px`);
    }, { passive: true });
}
