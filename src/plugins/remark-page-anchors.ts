import type { Code, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

const XREF_RE = /\[\[#([^\]|]+)(?:\|([^\]]+))?\]\]/g;
const VALID_ID = /^[\p{L}\p{N}_:.-]+$/u;

function metaValue(meta: string | null | undefined, key: string): string | undefined {
  if (!meta) return undefined;
  const re = new RegExp(
    `(?:^|\\s)${key}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s]+))`,
    "i",
  );
  const match = meta.match(re);
  return match?.[1] ?? match?.[2] ?? match?.[3];
}

function normalizeId(raw: string | null | undefined): string | undefined {
  const id = raw?.trim();
  return id && VALID_ID.test(id) ? id : undefined;
}

function textOf(node: any): string {
  if (!node) return "";
  if (node.type === "text" || node.type === "inlineCode") return node.value;
  if (Array.isArray(node.children)) return node.children.map(textOf).join("");
  return "";
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function locationOf(node: any): string {
  const line = node?.position?.start?.line;
  return line ? `line ${line}` : "unknown location";
}

/**
 * Adds a generic, non-hover cross-reference system to Markdown documents.
 *
 * Targets:
 * - fenced code blocks: `id="algo-1" label="Algorithm 1"` in the fence meta
 * - any other block: a leaf directive such as
 *   `::anchor[图 8]{#fig-8}`
 *
 * References:
 * - `[[#algo-1]]` uses the registered label (falling back to the id)
 * - `[[#algo-1|Algorithm 1]]` uses an explicit label
 *
 * References render as ordinary anchor links. There is intentionally no
 * tooltip/preview behavior.
 */
export function remarkPageAnchors() {
  return (tree: Root) => {
    const labels = new Map<string, string>();
    const seen = new Map<string, string>();

    const register = (id: string, label: string, node: any) => {
      const location = locationOf(node);
      if (seen.has(id)) {
        console.warn(
          `[page-anchors] duplicate id "${id}" at ${location}; already defined at ${seen.get(id)}`,
        );
      } else {
        seen.set(id, location);
      }
      labels.set(id, label);
    };

    // First pass: register fenced code blocks that have an id in their meta.
    visit(tree, "code", (node: Code) => {
      const raw = metaValue(node.meta, "id");
      if (!raw) return;

      const id = normalizeId(raw);
      if (!id) {
        console.warn(
          `[page-anchors] invalid id "${raw}" in code block at ${locationOf(node)}`,
        );
        return;
      }

      const label =
        metaValue(node.meta, "label") ?? metaValue(node.meta, "title") ?? id;
      register(id, label, node);
    });

    // First pass: register anchor directives and replace them with an empty
    // block-level target immediately before the referenced element.
    visit(tree, "leafDirective", (node: any, index: any, parent: any) => {
      if (node.name !== "anchor") return;

      // In the `{#id}` shorthand, `.` starts a class attribute. If a dot is
      // present, the parser turns the remainder into a class instead of
      // keeping it as part of the id. Use `-`/`_`, or the explicit
      // `{id="..."}` form, for ids that need a dot.
      if (node.attributes?.class) {
        console.warn(
          `[page-anchors] anchor directive at ${locationOf(node)} has class "${node.attributes.class}"; in {#id}, "." starts a class. Use "-"/"_" in the id, or write {id="..."}.`,
        );
        return;
      }

      const raw = node.attributes?.id;
      if (!raw) {
        console.warn(
          `[page-anchors] anchor directive at ${locationOf(node)} is missing {#id}`,
        );
        return;
      }

      const id = normalizeId(raw);
      if (!id) {
        console.warn(
          `[page-anchors] invalid id "${raw}" in anchor directive at ${locationOf(node)}`,
        );
        return;
      }

      const label =
        textOf(node).trim() ||
        String(node.attributes?.label ?? "").trim() ||
        id;
      register(id, label, node);

      if (!parent || index === undefined) return;
      parent.children[index] = {
        type: "html",
        value: `<div id="${escapeHtml(id)}" class="page-anchor"></div>`,
      } as any;
    });

    // Second pass: resolve [[#id]] / [[#id|label]] references in text.
    visit(tree, "text", (node: Text, index: number | undefined, parent: any) => {
      if (!parent || index === undefined) return;

      const value = node.value;
      if (!value.includes("[[#")) return;

      const replacements: { start: number; end: number; html: string }[] = [];
      XREF_RE.lastIndex = 0;

      let match: RegExpExecArray | null;
      while ((match = XREF_RE.exec(value)) !== null) {
        const id = normalizeId(match[1]);
        if (!id) continue;

        const display = match[2]?.trim() || labels.get(id) || id;
        const href = `#${encodeURIComponent(id)}`;
        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          html: `<a class="xref" href="${href}">${escapeHtml(display)}</a>`,
        });
      }

      if (replacements.length === 0) return;

      const newChildren: any[] = [];
      let pos = 0;
      for (const replacement of replacements) {
        if (replacement.start > pos) {
          newChildren.push({
            type: "text",
            value: value.slice(pos, replacement.start),
          });
        }
        newChildren.push({ type: "html", value: replacement.html });
        pos = replacement.end;
      }
      if (pos < value.length) {
        newChildren.push({ type: "text", value: value.slice(pos) });
      }

      parent.children.splice(index, 1, ...newChildren);
      return index + newChildren.length;
    });
  };
}
