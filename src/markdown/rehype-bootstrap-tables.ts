import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

// Markdig's UseBootstrap() gave article tables Bootstrap's .table styling; this keeps that, and wraps each
// table in a scroll container so wide tables don't force the whole page to scroll sideways on mobile.
export function rehypeBootstrapTables(): (tree: Root) => void {
    return (tree: Root): void => {
        visit(tree, 'element', (node: Element, index: number | undefined, parent: Root | Element | undefined): void => {
            if (node.tagName !== 'table' || parent === undefined || index === undefined) {
                return;
            }

            node.properties['className'] = ['table'];
            const wrapper: Element = {
                type: 'element',
                tagName: 'div',
                properties: { className: ['table-responsive'], tabIndex: 0, role: 'region', ariaLabel: 'Table' },
                children: [node],
            };
            parent.children[index] = wrapper;
        });
    };
}
