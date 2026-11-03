// The desktop platform a visitor is browsing from, judged from the user agent; undefined for phones, tablets,
// ChromeOS and anything unrecognized. iPadOS reports itself as a Mac, so a touch screen rules macOS out.
export function detectPlatform(userAgent: string, maxTouchPoints: number): 'macos' | 'windows' | 'linux' | undefined {
    if (/iPhone|iPad|iPod|Android|CrOS/u.test(userAgent)) {
        return undefined;
    }

    if (/Macintosh|Mac OS X/u.test(userAgent)) {
        return maxTouchPoints > 1 ? undefined : 'macos';
    }

    if (userAgent.includes('Windows')) {
        return 'windows';
    }

    return userAgent.includes('Linux') ? 'linux' : undefined;
}
