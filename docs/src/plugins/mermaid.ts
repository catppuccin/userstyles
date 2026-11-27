import { render } from "pele";

let counter = 0;

type Node = {
  type: string;
  lang?: string | null;
  value?: string;
  children?: Node[];
};

function visit(node: Node, fn: (node: Node) => Node | undefined): Node {
  if (node.type === "code") {
    const replaced = fn(node);
    if (replaced) {
      return replaced;
    }
  }

  if (node.children) {
    node.children = node.children.map((child) => visit(child, fn));
  }

  return node;
}

/**
 * Render Mermaid diagrams at build time instead of shipping Mermaid to the
 * browser. Each `mermaid` code block is replaced by the SVG that Pele produces.
 */
export default function peleMermaid() {
  return (tree: Node) => {
    visit(tree, (node) => {
      if (node.lang !== "mermaid" || !node.value) {
        return;
      }

      // Leave the block untouched when it cannot be rendered so the source
      // stays visible in the page rather than failing the whole build.
      try {
        const { svg } = render(node.value, { idPrefix: `pele-${counter++}` });
        return { type: "html", value: svg };
      } catch {
        return;
      }
    });
  };
}
