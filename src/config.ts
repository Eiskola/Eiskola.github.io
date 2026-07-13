// ============================================================
// Alpha 主题配置文件 — 修改此处即可自定义站点
// ============================================================

// ---- 站点元数据 ----
export const siteConfig = {
  title: "Alpha | Eiskola",
  description: "Notes on programming languages, compilers, and systems.",
  author: "eiskola",
  url: "https://eiskola.site",
} as const;

// ---- 导航栏 ----
export const navLinks: { label: string; href: string }[] = [
  { label: "posts", href: "/" },
  { label: "archive", href: "/archive" },
  { label: "about", href: "/about" },
];

// ---- 大纲 (Table of Contents) ----
export const tocConfig = {
  minDepth: 1, // 最小标题级别 (1 = h1)
  maxDepth: 3, // 最大标题级别 (3 = h3)
} as const;

// ---- 外观 ----
// 这些值会注入为 CSS 变量，可在 global.css 中覆盖
export const appearance = {
  maxWidth: "800px", // 正文区最大宽度
  fontSize: "17px", // 基础字号
  colors: {
    bg: "#ffffff",
    text: "#1a1a1a",
    muted: "#6b7280",
    accent: "#2563eb",
    border: "#e5e7eb",
    codeBg: "#f3f4f6",
  },
  fonts: {
    body: '"Palatino Linotype", Palatino, Georgia, "Noto Serif CJK SC", serif',
    heading: "system-ui, -apple-system, sans-serif",
    mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", monospace',
  },
} as const;

// ---- 代码块 ----
export const codeBlock = {
  theme: "github-light" as const, // Shiki/Expressive Code 主题
  showLineNumbers: true,
  wrap: true,
};
