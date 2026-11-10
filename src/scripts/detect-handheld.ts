// Whether a visitor is on a phone or tablet, judged from the user agent: the desktop apps can't be installed there, so
// their download buttons are hidden. iPadOS reports itself as a Mac, so a Mac with a touch screen counts as a tablet.
export function detectHandheld(userAgent: string, maxTouchPoints: number): boolean {
    if (/iPhone|iPad|iPod|Android/u.test(userAgent)) {
        return true;
    }

    return /Macintosh|Mac OS X/u.test(userAgent) && maxTouchPoints > 1;
}
