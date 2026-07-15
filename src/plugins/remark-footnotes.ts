import type { Root, Html, Text } from "mdast";
import { visit } from "unist-util-visit";

const REF_RE = /\[\^([^\]]+)\]/;
const DEF_RE = /^\[\^([^\]]+)\]:/;

export function remarkFootnotes() {
  return (tree: Root) => {
    const definitions = new Map<string, { children: any[]; counter: number }>();
    let counter = 0;

    // Step 1 — collect & remove definition paragraphs [^id]: content
    tree.children = tree.children.filter((node) => {
      if (node.type !== "paragraph") return true;
      const first = node.children[0];
      if (first?.type !== "text") return true;
      const m = first.value.match(DEF_RE);
      if (!m) return true;

      const id = m[1];
      first.value = first.value.slice(m[0].length).trimStart();
      // If content is empty after marker and there are no other children, skip
      if (!first.value && node.children.length === 1) {
        return false; // empty footnote definition — skip entirely
      }
      if (!first.value) node.children.shift(); // drop leading empty text node

      counter++;
      definitions.set(id, { children: node.children, counter });
      return false;
    });

    if (counter === 0) return; // no footnotes in this document

    // Step 2 — replace inline [^id] with <sup> links
    visit(tree, "text", (node, index, parent) => {
      if (!parent || index === undefined) return;
      const text = node.value;
      if (!REF_RE.test(text)) return;

      const pieces: (Text | Html)[] = [];
      let remaining = text;

      while (remaining.length > 0) {
        const m = remaining.match(REF_RE);
        if (!m || m.index === undefined) {
          pieces.push({ type: "text", value: remaining });
          break;
        }
        const id = m[1];
        if (m.index > 0) {
          pieces.push({ type: "text", value: remaining.slice(0, m.index) });
        }
        pieces.push({
          type: "html",
          value: `<sup class="footnote-ref" id="fnref-${id}"><a href="#fn-${id}">[${id}]</a></sup>`,
        } as Html);
        remaining = remaining.slice(m.index + m[0].length);
      }

      parent.children.splice(index, 1, ...pieces);
      return index + pieces.length;
    });

    // Step 3 — append footnotes section as raw HTML (cleanest for mixed content)
    const sorted = [...definitions.entries()].sort(
      (a, b) => a[1].counter - b[1].counter,
    );

    const lines: string[] = [
      `<hr class="footnotes-sep">`,
      `<section class="footnotes">`,
      `<ol class="footnotes-list">`,
    ];

    for (const [id, def] of sorted) {
      lines.push(
        `<li id="fn-${id}" class="footnote-item">`,
        ...def.children.map((child) => {
          // For simple text nodes, emit the text directly
          if (child.type === "text") return child.value;
          // For other nodes, wrap in a simple <p> to avoid raw-HTML-in-mdast issues
          // We use an html node to pass through already-processed children
          return ""; // placeholder — handled below
        }),
        ` <a href="#fnref-${id}" class="footnote-backref" aria-label="Back to reference ${id}">↩</a>`,
        `</li>`,
      );
    }

    lines.push(`</ol>`, `</section>`);

    // Push footnote section HTML
    tree.children.push({
      type: "html",
      value: `<hr class="footnotes-sep">`,
    });

    // Build each footnote item as proper mdast list items
    const footnoteItems: any[] = [];
    for (const [id, def] of sorted) {
      footnoteItems.push({
        type: "listItem",
        spread: false,
        data: {
          hProperties: { id: `fn-${id}`, class: "footnote-item" },
        },
        children: [
          ...def.children,
          {
            type: "paragraph",
            data: {
              hName: "span",
              hProperties: { class: "footnote-backref" }
            },
            children: [
              {
                type: "html",
                value: `<a href="#fnref-${id}" aria-label="Back to reference ${id}">↩</a>`,
              },
            ],
          },
        ],
      });
    }

    tree.children.push({
      type: "html",
      value: '<hr class="footnotes-sep">',
    });

    tree.children.push({
      type: "paragraph",
      data: {
        hName: "section",
        hProperties: { class: "footnotes" },
      },
      children: [
        {
          type: "list",
          ordered: true,
          spread: false,
          data: {
            hProperties: { class: "footnotes-list" },
          },
          children: footnoteItems,
        },
      ],
    } as any);
  };
}
