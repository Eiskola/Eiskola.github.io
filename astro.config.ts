// @ts-check
import expressiveCode from "astro-expressive-code";
import { pluginCollapsibleSections } from "@expressive-code/plugin-collapsible-sections";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import sitemap from "@astrojs/sitemap";
import { unified } from "@astrojs/markdown-remark";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkMath from "remark-math";
import { siteConfig, codeBlock } from "./src/config";
import { pluginBlockAnchors } from "./src/plugins/expressive-code/block-anchors";
import { pluginLanguageBadge } from "./src/plugins/expressive-code/language-badge";
import { pluginMathText } from "./src/plugins/expressive-code/math-text";
import { rehypeImageCaption } from "./src/plugins/rehype-image-caption";
import { remarkAdmonition } from "./src/plugins/remark-admonition";
import { remarkFootnotes } from "./src/plugins/remark-footnotes";
import { remarkPageAnchors } from "./src/plugins/remark-page-anchors";
import { remarkWikilink } from "./src/plugins/remark-wikilink";

// https://astro.build/config
export default defineConfig({
  site: siteConfig.url,
  markdown: {
    // Astro 7 defaults to the Sätteri processor; passing plugins requires the
    // `unified` remark/rehype processor from @astrojs/markdown-remark.
    processor: unified({
      remarkPlugins: [
        remarkWikilink,
        remarkMath,
        remarkDirective,
        remarkPageAnchors,
        remarkAdmonition,
        remarkFootnotes,
      ],
      rehypePlugins: [rehypeKatex, rehypeImageCaption],
    }),
  },
  // Allow Giscus iframe (giscus.app) to fetch custom theme CSS from dev server.
  // Astro's sec-fetch middleware blocks cross-site subresource requests by default.
  security: {
    allowedDomains: [{ origin: "https://giscus.app" }],
  },
  integrations: [
    sitemap(),
    expressiveCode({
      themes: [codeBlock.theme],
      shiki: {
        // `pcode` is rendered as plain text by Expressive Code; the math-text
        // plugin replaces its `$...$` spans with KaTeX output.
        langAlias: { pcode: "text" },
      },
      plugins: [
        pluginCollapsibleSections(),
        pluginLineNumbers(),
        pluginLanguageBadge(),
        pluginMathText(codeBlock.pcode),
        pluginBlockAnchors(),
      ],
      defaultProps: {
        wrap: codeBlock.wrap,
        showLineNumbers: codeBlock.showLineNumbers,
        overridesByLang: Object.fromEntries(
          Object.entries(codeBlock.lineNumbersByLang).map(([lang, showLineNumbers]) => [
            lang,
            { showLineNumbers },
          ]),
        ),
      },
      styleOverrides: {
        borderRadius: codeBlock.borderRadius,
        borderColor: codeBlock.borderColor,
        codeLineHeight: codeBlock.lineHeight,
        codeFontFamily: codeBlock.fontFamily,
        codeFontWeight: codeBlock.fontWeight,
        codeFontSize: codeBlock.fontSize,
        codeBackground: codeBlock.background,
        uiFontFamily: codeBlock.uiFontFamily,
        frames: codeBlock.frames,
        textMarkers: codeBlock.textMarkers,
      },
    }),
  ],
});
