import type { Paragraph, Root, RootContent } from "mdast";
import { visit } from "unist-util-visit";

const TYPES = ["note", "tip", "important", "caution", "warning"] as const;
type AdmonitionType = (typeof TYPES)[number];

/**
 * `remark-directive` adds this mdast node type at runtime. Define it locally
 * instead of relying on module augmentation so the plugin also works with
 * checkers that only load the project's source files.
 */
interface ContainerDirectiveNode {
  type: "containerDirective";
  name: string;
  data?: ParagraphDataWithHast;
  children: RootContent[];
}

interface DirectiveData {
  hName?: string;
  hProperties?: Record<string, unknown>;
  directiveLabel?: boolean;
}

type ParagraphDataWithHast = NonNullable<Paragraph["data"]> & DirectiveData;

function isAdmonitionType(name: string): name is AdmonitionType {
  return (TYPES as readonly string[]).includes(name);
}

function asContainerDirective(node: unknown): ContainerDirectiveNode | undefined {
  if (
    typeof node === "object" &&
    node !== null &&
    (node as { type?: unknown }).type === "containerDirective"
  ) {
    return node as ContainerDirectiveNode;
  }
  return undefined;
}

function makeTitleParagraph(text: string): Paragraph {
  const data: ParagraphDataWithHast = {
    hName: "span",
    hProperties: { class: "adm-title" },
  };

  return {
    type: "paragraph",
    children: [{ type: "text", value: text }],
    data,
  };
}

export function remarkAdmonition() {
  return (tree: Root) => {
    visit(tree, (node) => {
      const directive = asContainerDirective(node);
      if (!directive) return;

      const type = directive.name.toLowerCase();
      if (!isAdmonitionType(type)) return;

      const first = directive.children[0];
      const labelData =
        first?.type === "paragraph"
          ? (first.data as ParagraphDataWithHast | undefined)
          : undefined;

      // remark-directive turns a container label like `:::note[标题]` into a
      // paragraph with `data.directiveLabel = true`. Reuse it as the title so
      // that inline formatting inside the label is preserved.
      if (labelData?.directiveLabel) {
        first.data = {
          ...first.data,
          hName: "span",
          hProperties: {
            ...labelData.hProperties,
            class: "adm-title",
          },
        } as ParagraphDataWithHast;
      } else {
        // Insert a default title before the directive's content.
        directive.children.unshift(makeTitleParagraph(type.toUpperCase()));
      }

      // Set hast rendering info on the container itself.
      const data = directive.data ?? (directive.data = {});
      data.hName = "blockquote";
      data.hProperties = {
        ...data.hProperties,
        class: `adm adm-${type}`,
      };
    });
  };
}
