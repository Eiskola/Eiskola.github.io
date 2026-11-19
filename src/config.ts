// ============================================================
// Alpha 主题配置文件 — 修改此处即可自定义站点
// ============================================================

// ---- 站点元数据 ----
export const siteConfig = {
  title: "Alpha | Eiskola",
  description: "Notes on programming languages, compilers, and systems.",
  author: "eiskola",
  url: "https://eiskola.github.io",
  lang: "zh-CN", // <html lang>
  locale: "zh_CN", // Open Graph og:locale
  dateLocale: "zh-CN", // 文章日期格式化使用的 locale
  favicon: "/alpha.svg",
} as const;

// ---- 导航栏 ----
export const navLinks: { label: string; href: string }[] = [
  { label: "posts", href: "/" },
  { label: "archive", href: "/archive" },
  { label: "search", href: "/search" },
  { label: "about", href: "/about" },
];

// ---- 大纲 (Table of Contents) ----
export const tocConfig = {
  minDepth: 1, // 最小标题级别 (1 = h1)
  maxDepth: 3, // 最大标题级别 (3 = h3)
} as const;

// ---- 主题切换 ----
export const themeConfig = {
  defaultTheme: "light", // 未保存过主题时使用
  storageKey: "theme", // localStorage 键名
  order: ["light", "warm", "dark"], // 点击切换按钮时的循环顺序
} as const;

// ---- 外观 ----
// 这些值由 BaseLayout 注入为 CSS 变量，无需在 global.css 中重复定义。
export const appearance = {
  maxWidth: "800px", // 正文区最大宽度
  maxWidthFull: "1000px", // 宽屏内容区最大宽度
  fontSize: "17px", // 桌面端基础字号
  mobileFontSize: "15px", // 移动端基础字号
  lineHeight: 1.8, // 正文行高
  fonts: {
    // 正文西文使用 Times New Roman，中文保持宋体。
    body: '"Times New Roman", Times, "Noto Serif CJK SC", serif',
    // 标题西文使用 Times New Roman，中文使用系统默认的 Noto Sans CJK SC。
    heading: '"Times New Roman", Times, "Noto Sans CJK SC", sans-serif',
    // 拉丁字符和符号使用 JetBrains Mono；中文回退到正文字体。
    mono: '"JetBrains Mono", "Fira Code", "Cascadia Code", "Noto Serif CJK SC", "Noto Sans Math", "Segoe UI Symbol", "Apple Symbols", serif',
  },
  themes: {
    light: {
      colorScheme: "light",
      colors: {
        bg: "#ffffff",
        text: "#1a1a1a",
        muted: "#6b7280",
        accent: "#2563eb",
        border: "#e5e7eb",
        codeBg: "#f3f4f6",
        markBg: "#fff3cd",
        markBorder: "#ffc107",
        insBg: "#d4edda",
        insBorder: "#28a745",
        delBg: "#f8d7da",
        delBorder: "#dc3545",
        admonitions: {
          note: { bg: "#eef2ff", border: "#6366f1", text: "#4f46e5" },
          tip: { bg: "#ecfdf5", border: "#10b981", text: "#059669" },
          important: { bg: "#fef9c3", border: "#eab308", text: "#a16207" },
          caution: { bg: "#fef2f2", border: "#ef4444", text: "#dc2626" },
          warning: { bg: "#fff7ed", border: "#f97316", text: "#ea580c" },
        },
      },
    },
    warm: {
      colorScheme: "light",
      colors: {
        bg: "#fdf7ed",
        text: "#3d2e1e",
        muted: "#9b7b5a",
        accent: "#c45d0a",
        border: "#e8d5c0",
        codeBg: "#f5ecdb",
        markBg: "#fef0c0",
        markBorder: "#d4a017",
        insBg: "#d4f0e0",
        insBorder: "#4a9e6f",
        delBg: "#fce0e0",
        delBorder: "#c95b63",
        admonitions: {
          note: { bg: "#f2f0fc", border: "#818cf8", text: "#4f46e5" },
          tip: { bg: "#ecfaf2", border: "#34d399", text: "#059669" },
          important: { bg: "#fef7c0", border: "#eab308", text: "#a16207" },
          caution: { bg: "#fef0ee", border: "#f87171", text: "#dc2626" },
          warning: { bg: "#fef4eb", border: "#fb923c", text: "#ea580c" },
        },
      },
      // Expressive Code 的框架色，用于覆盖主题自带的冷灰色。
      codeFrame: {
        "--ec-frm-edTabBarBg": "#eadbc8",
        "--ec-frm-edActTabFg": "#3d2e1e",
        "--ec-frm-trmTtbBg": "#eadbc8",
        "--ec-frm-trmTtbFg": "#3d2e1e",
        "--ec-frm-trmTtbDotsFg": "#3d2e1e",
        "--ec-frm-inlBtnFg": "#3d2e1e",
        "--ec-frm-inlBtnBg": "#3d2e1e",
        "--ec-frm-inlBtnBrd": "#3d2e1e",
      },
      syntaxFilter: "contrast(1.1) saturate(1.3)",
    },
    dark: {
      colorScheme: "dark",
      colors: {
        bg: "#292520",
        text: "#cbc3b6",
        muted: "#9b8e7e",
        accent: "#e8a610",
        border: "#3d3832",
        codeBg: "#302b26",
        markBg: "#4a3d1a",
        markBorder: "#b8860b",
        insBg: "#1a3d2a",
        insBorder: "#4a9e6f",
        delBg: "#4a2020",
        delBorder: "#c95b63",
        admonitions: {
          note: { bg: "#1e1b4b", border: "#6366f1", text: "#a5b4fc" },
          tip: { bg: "#022c22", border: "#059669", text: "#6ee7b7" },
          important: { bg: "#3d1f06", border: "#b45309", text: "#fcd34d" },
          caution: { bg: "#450a0a", border: "#dc2626", text: "#fca5a5" },
          warning: { bg: "#3d1407", border: "#ea580c", text: "#fdba74" },
        },
      },
      codeFrame: {
        "--ec-frm-edTabBarBg": "#2d2a25",
        "--ec-frm-edActTabFg": "#c9c0b0",
        "--ec-frm-edActTabBg": "var(--color-code-bg)",
        "--ec-frm-trmTtbBg": "#2d2a25",
        "--ec-frm-trmTtbFg": "#c9c0b0",
        "--ec-frm-trmTtbDotsFg": "#c9c0b0",
        "--ec-uiSelBg": "#39414a",
        "--ec-uiSelFg": "#c9d1d9",
        "--ec-sbThumbCol": "#6a737d33",
        "--ec-sbThumbHoverCol": "#6a737d44",
        "--ec-focusBrd": "#1f6feb",
        "--ec-frm-inlBtnFg": "#c9d1d9",
        "--ec-frm-inlBtnBg": "#c9d1d9",
        "--ec-frm-inlBtnBrd": "#c9d1d9",
        "--ec-frm-shdCol": "#00000060",
        "--ec-frm-tooltipSuccessBg": "#238636",
      },
      syntaxFilter: "invert(1) hue-rotate(180deg) saturate(1.2)",
    },
  },
} as const;

// ---- 文章行为 ----
export const postConfig = {
  readingSpeed: 400, // 阅读时间估算：每分钟字符数
  relatedPostsLimit: 3, // 相关文章最多显示几篇
} as const;

// ---- 搜索 (Pagefind) ----
export const searchConfig = {
  placeholder: "搜点什么吧，虽然笔记可能还没写…",
  showImages: false,
} as const;

// ---- 评论 (Giscus) ----
// 在 GitHub 仓库启用 Discussions 并安装 Giscus App 后，
// 访问 https://giscus.app 获取 repo-id 和 category-id
export const giscus = {
  repo: "Eiskola/Eiskola.github.io" as const,
  repoId: "R_kgDOTW-afw", // ← 替换
  category: "Announcements" as const,
  categoryId: "DIC_kwDOTW-af84DBPCP", // ← 替换
  mapping: "pathname" as const,
  reactionsEnabled: "1" as const,
  emitMetadata: "0" as const,
  inputPosition: "top" as const,
  lang: "zh-CN" as const,
  themePath: "/giscus", // 自定义 Giscus 主题 CSS 所在目录
} as const;

// ---- 代码块 ----
export const codeBlock = {
  theme: "github-light" as const, // Shiki/Expressive Code 主题
  showLineNumbers: true,
  wrap: true,

  // 排版
  fontFamily: "var(--font-mono)",
  fontWeight: "400", // 代码正文使用常规字重
  fontSize: "0.82rem",
  lineHeight: "1.5rem",
  uiFontFamily: "var(--font-heading)",

  // 外观
  borderRadius: "0.5rem",
  borderColor: "var(--color-border)",
  background: "var(--color-code-bg)",
  frames: {
    editorBackground: "var(--color-code-bg)",
    terminalBackground: "var(--color-code-bg)",
    terminalTitlebarBackground: "#e5e7eb",
    editorTabBarBackground: "#e5e7eb",
    editorActiveTabBackground: "var(--color-bg)",
    editorActiveTabIndicatorBottomColor: "var(--color-accent)",
    editorActiveTabIndicatorTopColor: "transparent",
    editorTabBarBorderBottomColor: "var(--color-border)",
    terminalTitlebarBorderBottomColor: "var(--color-border)",
  },
  // 标记颜色复用主题色板，深色/暖色模式会自动跟随。
  textMarkers: {
    markBackground: "var(--color-mark-bg)",
    markBorderColor: "var(--color-mark-border)",
    insBackground: "var(--color-ins-bg)",
    insBorderColor: "var(--color-ins-border)",
    delBackground: "var(--color-del-bg)",
    delBorderColor: "var(--color-del-border)",
  },
  // 这些语言的代码块默认不显示行号。
  lineNumbersByLang: {
    shellsession: false,
    bash: false,
    sh: false,
  },

  // 富文本伪代码 (`pcode`) 的独立排版。
  pcode: {
    fontFamily: '"Times New Roman", Times, "Noto Serif CJK SC", serif',
    fontWeight: "400",
    fontSize: "0.95rem",
    mobileFontSize: "0.9rem",
    mobilePaddingInline: "0.7rem",
  },
} as const;
