import type { Properties } from "hast";

declare module "mdast" {
  interface Data {
    /**
     * Field supported by `mdast-util-to-hast` to signal that a node should
     * result in a particular element, instead of its default behavior.
     */
    hName?: string | undefined;
    /**
     * Field supported by `mdast-util-to-hast` to signal that a node should
     * result in an element with these properties.
     */
    hProperties?: Properties | undefined;
  }
}
