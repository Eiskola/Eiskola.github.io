import type { Root, Paragraph, Text } from "mdast";
import { visit } from "unist-util-visit";

const TYPES = ["note", "tip", "important", "caution", "warning"] as const;

function makeTitleParagraph(text: string): Paragraph {
  return {
    type: "paragraph",
    children: [
      {
        type: "text",
        value: text,
      } as Text,
    ],
    data: {
      hName: "span",
      hProperties: { class: "adm-title" },
    },
  };
}

export function remarkAdmonition() {
  return (tree: Root) => {
    visit(tree, "containerDirective", (node) => {
      const type = node.name;
      if (!TYPES.includes(type as any)) return;

      const data = node.data || (node.data = {});
      const attributes = (node.attributes || {}) as Record<string, string>;
      const label = attributes["has-directive-label"];

      let titleText = type.toUpperCase();

      // Extract label text from first child if present
      if (label && node.children.length > 0) {
        const first = node.children[0];
        if (
          first.type === "paragraph" &&
          first.children.length > 0 &&
          first.children[0].type === "text"
        ) {
          titleText = first.children[0].value;
          node.children = node.children.slice(1);
        }
      }

      // Prepend title paragraph to children
      node.children = [makeTitleParagraph(titleText), ...node.children];

      // Set hast rendering info
      data.hName = "blockquote";
      data.hProperties = { class: `adm adm-${type}` };
    });
  };
}
