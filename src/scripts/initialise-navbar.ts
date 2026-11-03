const scrolledThreshold: number = 8;

// Gives the fixed header its frosted background once the page scrolls under it.
export function initialiseNavbar(): void {
    const header: Element | null = document.querySelector('.site-header');

    if (header === null) {
        return;
    }

    function update(): void {
        header?.classList.toggle('is-scrolled', window.scrollY > scrolledThreshold);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
}
