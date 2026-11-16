import {
  ExpressiveCodeAnnotation,
  definePlugin,
} from "@expressive-code/core";
import type { AnnotationRenderOptions } from "@expressive-code/core";
import type { Element, ElementContent, Parents } from "hast";
import { fromHtml } from "hast-util-from-html";
import { h } from "hastscript";
import katex from "katex";

/**
 * A line of `pcode` content is split into plain text and inline math.
 * Math is delimited by unescaped `$...$` pairs.
 */
type Segment =
  | { type: "text"; value: string }
  | { type: "math"; value: string };

function hasMath(text: string): boolean {
  return /(?<!\\)\$[^$\n]+?\$/.test(text);
}

function parseLine(text: string): Segment[] {
  const segments: Segment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(/(?<!\\)\$([^$\n]+?)\$/g)) {
    const index = match.index ?? 0;
    if (index > cursor) {
      segments.push({
        type: "text",
        value: text.slice(cursor, index).replace(/\\\$/g, "$"),
      });
    }
    segments.push({ type: "math", value: match[1] });
    cursor = index + match[0].length;
  }

  if (cursor < text.length) {
    segments.push({
      type: "text",
      value: text.slice(cursor).replace(/\\\$/g, "$"),
    });
  }

  return segments;
}

function renderMath(source: string): Element {
  const html = katex.renderToString(source, {
    throwOnError: false,
    displayMode: false,
    output: "htmlAndMathml",
    strict: false,
    trust: false,
  });

  const fragment = fromHtml(html, { fragment: true });

  return h(
    "span.pcode-math",
    fragment.children.filter(
      (child): child is ElementContent =>
        child.type === "element" || child.type === "text",
    ),
  );
}

function renderSegments(segments: Segment[]): ElementContent[] {
  return segments.map((segment) =>
    segment.type === "text"
      ? { type: "text", value: segment.value }
      : renderMath(segment.value),
  );
}

function findCodeWrapper(node: Element): Element | undefined {
  for (const child of node.children) {
    if (child.type !== "element") continue;

    const className = child.properties?.className;
    const isCodeWrapper =
      child.tagName === "div" &&
      (Array.isArray(className)
        ? className.includes("code")
        : className === "code");

    if (isCodeWrapper) return child;

    const nested = findCodeWrapper(child);
    if (nested) return nested;
  }

  return undefined;
}

class MathLineAnnotation extends ExpressiveCodeAnnotation {
  constructor(private readonly source: string) {
    // Run after Expressive Code has rendered highlighting and markers so that
    // replacing the line contents does not discard their output.
    super({ renderPhase: "latest" });
  }

  render({ nodesToTransform }: AnnotationRenderOptions): Parents[] {
    const lineNode = nodesToTransform[0];
    if (lineNode.type !== "element") return nodesToTransform;

    const codeWrapper = findCodeWrapper(lineNode);
    if (!codeWrapper) return nodesToTransform;

    codeWrapper.children = renderSegments(parseLine(this.source));
    return [lineNode];
  }
}

/**
 * Adds a `pcode` fenced code block language that renders `$...$` spans with
 * KaTeX while keeping Expressive Code's frame, line numbers, marks and copy
 * button. This is intended for pseudocode and other text where plain `text`
 * blocks cannot express subscripts, hats, set operators, etc.
 */
export function pluginMathText() {
  return definePlugin({
    name: "Math text",
    baseStyles: () => `
      /* pcode prose uses a paper-like serif; KaTeX keeps its own math font. */
      pre[data-language="pcode"] > code {
        font-family: "Times New Roman", Times, "Noto Serif CJK SC", serif;
        /* Keep pcode at Medium even though regular code blocks are bolder. */
        font-weight: 500;
      }

      /* Slightly larger than regular code blocks for long-form pseudocode. */
      pre[data-language="pcode"] {
        --ec-codeFontSize: 0.95rem;
      }

      /* On narrow screens, use a smaller step up and trim the horizontal
         padding so long pseudocode lines fit without page overflow. */
      @media (max-width: 640px) {
        pre[data-language="pcode"] {
          --ec-codeFontSize: 0.9rem;
          --ec-codePadInl: 0.7rem;
        }
      }

      /* Expressive Code resets all descendant styles with a high-specificity
         rule, so restore KaTeX's base font and positioning here. Without the
         font-family, symbols such as \\not (used by \\neq) inherit the code
         font and render as tofu. */
      .pcode-math .katex {
        position: relative;
        font-family: KaTeX_Main, "Times New Roman", serif;
        font-size: 1em;
        font-style: normal;
        font-weight: normal;
        line-height: 1.2;
        text-indent: 0;
        text-rendering: auto;
      }
      .pcode-math .katex-display {
        margin: 0;
      }
    `,
    hooks: {
      annotateCode: ({ codeBlock }) => {
        if (codeBlock.language !== "pcode") return;

        for (const line of codeBlock.getLines()) {
          if (hasMath(line.text) || line.text.includes("\\$")) {
            line.addAnnotation(new MathLineAnnotation(line.text));
          }
        }
      },
    },
  });
}
