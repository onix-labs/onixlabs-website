// The index of the section being read: the last heading that has scrolled up past the line `offset` pixels from the top
// of the viewport, or the first heading before any has. At the bottom of the page the last heading wins, even when it's
// too near the end ever to reach the line. -1 when there are no headings.
export function selectCurrentHeading(headingTops: ReadonlyArray<number>, offset: number, atBottom: boolean): number {
    if (headingTops.length === 0) {
        return -1;
    }

    if (atBottom) {
        return headingTops.length - 1;
    }

    const passed: number = headingTops.findLastIndex((top: number): boolean => top <= offset);
    return Math.max(passed, 0);
}
