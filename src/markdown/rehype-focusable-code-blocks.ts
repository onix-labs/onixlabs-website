import type { Element, Root } from 'hast';
import { visit } from 'unist-util-visit';

// Long code lines scroll horizontally inside <pre>; keyboard users can only scroll a region they can focus.
export function rehypeFocusableCodeBlocks(): (tree: Root) => void {
    return (tree: Root): void => {
        visit(tree, 'element', (node: Element): void => {
            if (node.tagName === 'pre') {
                node.properties['tabIndex'] = 0;
            }
        });
    };
}
