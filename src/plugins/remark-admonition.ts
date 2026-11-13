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
      const first = node.children[0];

      // remark-directive turns a container label like `:::note[标题]` into a
      // paragraph with `data.directiveLabel = true`. Reuse it as the title so
      // that inline formatting inside the label is preserved.
      if (
        first?.type === "paragraph" &&
        (first.data as { directiveLabel?: boolean } | undefined)?.directiveLabel
      ) {
        first.data = {
          ...first.data,
          hName: "span",
          hProperties: { class: "adm-title" },
        };
        node.children = [first, ...node.children.slice(1)];
      } else {
        // Prepend the default title paragraph to children
        node.children = [makeTitleParagraph(type.toUpperCase()), ...node.children];
      }

      // Set hast rendering info
      data.hName = "blockquote";
      data.hProperties = { class: `adm adm-${type}` };
    });
  };
}
