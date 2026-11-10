// Starts each video[data-lazy-video] only when it comes near the viewport: its sources carry their URL in data-src until
// then, so the file isn't fetched for a visitor who never scrolls that far. Under reduced motion the video stays off,
// and the poster image beneath it shows instead. Without this script the video never loads, and the poster shows too.
export function initialiseLazyVideo(): void {
    const videos: ReadonlyArray<HTMLVideoElement> = [...document.querySelectorAll<HTMLVideoElement>('video[data-lazy-video]')];

    if (videos.length === 0 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
    }

    const observer: IntersectionObserver = new IntersectionObserver((entries: ReadonlyArray<IntersectionObserverEntry>): void => {
        for (const entry of entries) {
            if (entry.isIntersecting && entry.target instanceof HTMLVideoElement) {
                start(entry.target);
                observer.unobserve(entry.target);
            }
        }
    }, { rootMargin: '25% 0px' });

    videos.forEach((video: HTMLVideoElement): void => {
        observer.observe(video);
    });
}

function start(video: HTMLVideoElement): void {
    for (const source of video.querySelectorAll<HTMLSourceElement>('source[data-src]')) {
        source.src = source.dataset['src'] ?? '';
        source.removeAttribute('data-src');
    }

    video.load();
    video.play().catch((): void => undefined);
}
