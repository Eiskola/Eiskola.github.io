// @ts-check
import expressiveCode from "astro-expressive-code";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { defineConfig } from "astro/config";
import remarkDirective from "remark-directive";
import { siteConfig, codeBlock } from "./src/config";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge";
import { rehypeImageCaption } from "./src/plugins/rehype-image-caption";
import { remarkAdmonition } from "./src/plugins/remark-admonition";

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  markdown: {
    remarkPlugins: [remarkDirective, remarkAdmonition],
    rehypePlugins: [rehypeImageCaption],
  },
  integrations: [
    expressiveCode({
      themes: [codeBlock.theme],
      plugins: [
        pluginCollapsibleSections(),
        pluginLineNumbers(),
        pluginLanguageBadge(),
      ],
      defaultProps: {
        wrap: codeBlock.wrap,
        showLineNumbers: codeBlock.showLineNumbers,
        overridesByLang: {
          shellsession: { showLineNumbers: false },
          bash: { showLineNumbers: false },
          sh: { showLineNumbers: false },
        },
      },
      styleOverrides: {
        borderRadius: "0.5rem",
        borderColor: "var(--color-border)",
        codeLineHeight: "1.5rem",
        codeFontFamily: "var(--font-mono)",
        codeFontSize: "0.82rem",
        codeBackground: "var(--color-code-bg)",
        uiFontFamily: "var(--font-heading)",
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
        textMarkers: {
          markBackground: "#fff3cd",
          markBorderColor: "#ffc107",
          insBackground: "#d4edda",
          insBorderColor: "#28a745",
          delBackground: "#f8d7da",
          delBorderColor: "#dc3545",
        },
      },
    }),
  ],
});
