// One crumb in a Breadcrumb trail. The last crumb is the current page; the others link to `href`.
export interface BreadcrumbItem {
    readonly label: string;
    readonly href?: string;
}
