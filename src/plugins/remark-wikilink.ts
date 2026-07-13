import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Root, Text } from "mdast";
import { visit } from "unist-util-visit";

const POSTS_DIR = path.resolve("src/content/posts");

interface PostEntry {
  url: string;
  title: string;
}

let postMap: Map<string, PostEntry> | null = null;

function buildPostMap(): Map<string, PostEntry> {
  if (postMap) return postMap;
  postMap = new Map();

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.name.endsWith(".md") || entry.name.endsWith(".mdx")) {
        const raw = fs.readFileSync(full, "utf-8");
        const { data } = matter(raw);
        if (!data.title) return;

        const rel = path.relative(POSTS_DIR, full).replace(/\.mdx?$/, "");
        // Mimic Astro glob loader slug: lowercase + strip dots and special chars
        const slugged = rel
          .split("/")
          .map((seg) => seg.toLowerCase().replace(/[^a-z0-9一-鿿-]/g, ""))
          .join("/");
        const url = `/posts/${slugged}`;
        // Index by both raw ID and slugged ID
        postMap!.set(rel, { url, title: data.title });
        if (slugged !== rel) {
          postMap!.set(slugged, { url, title: data.title });
        }
        // Also index by filename (last segment, slugged)
        const basename = slugged.split("/").pop() || slugged;
        if (!postMap!.has(basename)) {
          postMap!.set(basename, { url, title: data.title });
        }
      }
    }
  }

  walk(POSTS_DIR);
  return postMap;
}

export function remarkWikilink() {
  const map = buildPostMap();

  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || !("children" in parent) || index === undefined) return;

      const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
      const value = node.value;
      const replacements: { start: number; end: number; html: string }[] = [];

      let match: RegExpExecArray | null;
      while ((match = regex.exec(value)) !== null) {
        const id = match[1].trim();
        const display = match[2]?.trim();
        const entry = map.get(id);
        if (entry) {
          replacements.push({
            start: match.index,
            end: match.index + match[0].length,
            html: `<a href="${entry.url}">${display || entry.title}</a>`,
          });
        }
      }

      if (replacements.length === 0) return;

      const newChildren: any[] = [];
      let pos = 0;
      for (const r of replacements) {
        if (r.start > pos) {
          newChildren.push({ type: "text", value: value.slice(pos, r.start) });
        }
        newChildren.push({ type: "html", value: r.html });
        pos = r.end;
      }
      if (pos < value.length) {
        newChildren.push({ type: "text", value: value.slice(pos) });
      }

      parent.children.splice(index, 1, ...newChildren);
    });
  };
}
