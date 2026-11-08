// A group of articles on /Documentation: its name, the two-part headline of its band on the hub, and what it's for.
export interface DocumentationCategory {
    readonly id: string;
    readonly name: string;
    readonly title: string;
    readonly highlight: string;
    readonly lead: string;
}
