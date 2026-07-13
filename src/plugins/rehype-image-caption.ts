import type { Root, Element, Text } from "hast";
import { visit } from "unist-util-visit";

function isOnlyImageChild(parent: Element): boolean {
  const meaningful = parent.children.filter(
    (c) => !(c.type === "text" && /^\s*$/.test((c as Text).value))
  );
  return meaningful.length === 1 && (meaningful[0] as Element).tagName === "img";
}

export function rehypeImageCaption() {
  return (tree: Root) => {
    visit(tree, "element", (node: Element, _index, parent) => {
      if (node.tagName !== "img") return;
      if (!node.properties?.alt) return;

      const alt = String(node.properties.alt);
      if (!alt.trim()) return;

      if (!parent || !("tagName" in parent)) return;
      const parentEl = parent as Element;

      // Already wrapped
      if (parentEl.tagName === "figure") return;

      // If img is only child of a <p>, repurpose the <p> as <figure>
      const wrapper =
        parentEl.tagName === "p" && isOnlyImageChild(parentEl)
          ? parentEl
          : null;

      if (wrapper) {
        wrapper.tagName = "figure";
        wrapper.properties = { class: "img-figure" };
        // append figcaption to existing children (which is just the img)
        wrapper.children.push({
          type: "element",
          tagName: "figcaption",
          properties: { class: "img-caption" },
          children: [{ type: "text", value: alt }],
        });
      }
    });
  };
}
