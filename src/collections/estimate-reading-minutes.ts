const wordsPerMinute: number = 220;

export function estimateReadingMinutes(text: string): number {
    const words: number = text.split(/\s+/).filter((word: string): boolean => word.length > 0).length;
    return Math.max(1, Math.round(words / wordsPerMinute));
}
