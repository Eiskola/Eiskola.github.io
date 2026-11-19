import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import type { Link, PhrasingContent, Root, Text } from "mdast";
import { visit } from "unist-util-visit";

const POSTS_DIR = path.resolve("src/content/posts");

interface PostEntry {
  url: string;
  title: string;
}

interface Replacement {
  start: number;
  end: number;
  link: Link;
}

let postMap: Map<string, PostEntry> | null = null;

function slugSegment(segment: string): string {
  return segment
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}_-]/gu, "");
}

function buildPostMap(): Map<string, PostEntry> {
  if (postMap) return postMap;

  const map = new Map<string, PostEntry>();
  const basenames = new Map<string, PostEntry | null>();

  function walk(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
      const full = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        walk(full);
        continue;
      }

      if (!/\.md$/i.test(entry.name)) continue;

      const raw = fs.readFileSync(full, "utf-8");
      const { data } = matter(raw);
      const title = typeof data.title === "string" ? data.title.trim() : "";

      // Keep links in sync with the pages that are actually generated.
      if (!title || data.draft === true) continue;

      const rel = path
        .relative(POSTS_DIR, full)
        .replace(/\\/g, "/")
        .replace(/\.md$/i, "");

      // Mimic Astro's glob loader slug (github-slugger per path segment):
      // lowercase, whitespace to hyphens, preserve letters/numbers/_/-.
      const slugged = rel.split("/").map(slugSegment).join("/");
      const post: PostEntry = { url: `/posts/${slugged}`, title };

      // Index by both raw ID and slugged ID.
      map.set(rel, post);
      if (slugged !== rel) map.set(slugged, post);

      // Also index by filename. Duplicate filenames are ambiguous, so they
      // are only added after the walk if the basename stayed unique.
      const basename = slugged.split("/").pop();
      if (basename) {
        const existing = basenames.get(basename);
        if (existing === undefined) {
          basenames.set(basename, post);
        } else if (existing && existing.url !== post.url) {
          basenames.set(basename, null);
        }
      }
    }
  }

  walk(POSTS_DIR);

  for (const [basename, entry] of basenames) {
    if (entry && !map.has(basename)) map.set(basename, entry);
  }

  postMap = map;
  return map;
}

export function remarkWikilink() {
  const map = buildPostMap();

  return (tree: Root) => {
    visit(tree, "text", (node: Text, index, parent) => {
      if (!parent || index === undefined) return;
      if (!node.value.includes("[[")) return;

      const regex = /\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g;
      const value = node.value;
      const replacements: Replacement[] = [];

      let match: RegExpExecArray | null;
      while ((match = regex.exec(value)) !== null) {
        const id = match[1].trim();
        const display = match[2]?.trim();
        const entry = map.get(id);
        if (!entry) continue;

        replacements.push({
          start: match.index,
          end: match.index + match[0].length,
          link: {
            type: "link",
            url: entry.url,
            children: [{ type: "text", value: display || entry.title }],
          },
        });
      }

      if (replacements.length === 0) return;

      const newChildren: PhrasingContent[] = [];
      let pos = 0;

      for (const replacement of replacements) {
        if (replacement.start > pos) {
          newChildren.push({
            type: "text",
            value: value.slice(pos, replacement.start),
          });
        }
        newChildren.push(replacement.link);
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
