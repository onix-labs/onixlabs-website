export interface TechArticleDetails {
    readonly title: string;
    readonly description: string;
    readonly path: string;
    readonly section: string;
    readonly authorPath: string | undefined;
    readonly authorName: string | undefined;
    readonly published: Date | undefined;
    readonly updated: Date | undefined;
}
