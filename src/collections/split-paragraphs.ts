export function splitParagraphs(text: string): ReadonlyArray<string> {
    return text.split(/\n+/).map((paragraph: string): string => paragraph.trim()).filter((paragraph: string): boolean => paragraph.length > 0);
}
