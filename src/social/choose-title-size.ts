// The largest size, in pixels, that keeps a headline to three or so lines beside a picture.
export function chooseTitleSize(headline: string): number {
    if (headline.length <= 22) {
        return 74;
    }

    return headline.length <= 40 ? 66 : 58;
}
