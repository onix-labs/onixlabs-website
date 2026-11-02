const scrolledThreshold: number = 50;

export function initialiseNavbar(): void {
    const navbar: HTMLElement | null = document.getElementById('navbar');

    if (navbar === null) {
        return;
    }

    function update(): void {
        navbar?.classList.toggle('scrolled', window.scrollY > scrolledThreshold);
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
}
