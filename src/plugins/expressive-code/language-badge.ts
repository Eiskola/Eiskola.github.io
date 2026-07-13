import { definePlugin } from "@expressive-code/core";

export function pluginLanguageBadge() {
  return definePlugin({
    name: "Language Badge",
    baseStyles: () => `
      [data-language]::before {
        position: absolute;
        z-index: 2;
        right: 0.5rem;
        top: 0.5rem;
        padding: 0.1rem 0.5rem;
        content: attr(data-language);
        font-family: var(--font-mono);
        font-size: 0.7rem;
        font-weight: 500;
        text-transform: uppercase;
        color: var(--color-muted);
        background: var(--color-border);
        border-radius: 0.25rem;
        pointer-events: none;
        transition: opacity 0.3s;
        opacity: 0;
      }
      .frame:not(.has-title):not(.is-terminal) {
        @media (hover: none) {
          & [data-language]::before {
            opacity: 1;
          }
        }
        @media (hover: hover) {
          & [data-language]::before {
            opacity: 1;
          }
          &:hover [data-language]::before {
            opacity: 0;
          }
        }
      }
    `,
  });
}
