import { selectCurrentHeading } from './select-current-heading';

// Marks the [data-outline] link for the section being read with aria-current="location", as the page scrolls. The
// outline is ordinary links without it, so nothing depends on this script.
export function initialiseOutlineScrollspy(): void {
    const outline: HTMLElement | null = document.querySelector<HTMLElement>('[data-outline]');

    if (outline === null) {
        return;
    }

    const links: ReadonlyArray<HTMLAnchorElement> = Array.from(outline.querySelectorAll<HTMLAnchorElement>('a[href^="#"]'));
    const headings: ReadonlyArray<HTMLElement> = links
        .map((link: HTMLAnchorElement): HTMLElement | null => document.getElementById(decodeURIComponent(link.hash.slice(1))))
        .filter((heading: HTMLElement | null): heading is HTMLElement => heading !== null);

    if (headings.length !== links.length) {
        return;
    }

    let scheduled: boolean = false;

    function update(): void {
        scheduled = false;
        const offset: number = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) + 1;
        const atBottom: boolean = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
        const tops: ReadonlyArray<number> = headings.map((heading: HTMLElement): number => heading.getBoundingClientRect().top);
        const current: number = selectCurrentHeading(tops, offset, atBottom);

        links.forEach((link: HTMLAnchorElement, index: number): void => {
            if (index === current) {
                link.setAttribute('aria-current', 'location');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    }

    function schedule(): void {
        if (!scheduled) {
            scheduled = true;
            requestAnimationFrame(update);
        }
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    update();
}
