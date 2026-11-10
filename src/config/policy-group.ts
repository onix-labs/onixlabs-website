// A group of policies: its name in the footer and on the /Legal hub, and the headline and lead of its band there.
// `footerColumn` folds the group into another group's column in the footer, after that group's own policies.
export interface PolicyGroup {
    readonly id: 'legal' | 'responsibility' | 'trust';
    readonly name: string;
    readonly title: string;
    readonly highlight: string;
    readonly lead: string;
    readonly footerColumn?: PolicyGroup['id'];
}
