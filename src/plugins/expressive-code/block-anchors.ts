import { definePlugin } from "@expressive-code/core";

// Matches the IDs accepted by the remark page-anchor plugin. Keeping the
// fragment free of quotes, spaces and HTML-special characters makes it safe to
// place directly into the rendered attribute.
const VALID_ID = /^[\p{L}\p{N}_:.-]+$/u;

/**
 * Adds an `id` attribute to rendered code blocks based on the `id="..."`
 * option in the fence meta, e.g.:
 *
 * ```pcode id="algo-1" label="Algorithm 1"
 * ```
 *
 * The matching `label` is consumed by the remark page-anchor plugin to
 * resolve bare references like `[[#algo-1]]`.
 */
export function pluginBlockAnchors() {
  return definePlugin({
    name: "Block anchors",
    hooks: {
      postprocessRenderedBlock: ({ codeBlock, renderData }) => {
        const id = codeBlock.metaOptions.getString("id")?.trim();
        if (!id || !VALID_ID.test(id)) return;

        renderData.blockAst.properties = {
          ...(renderData.blockAst.properties || {}),
          id,
        };
      },
    },
  });
}
