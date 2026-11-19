import { appearance } from "../config";

type Theme = (typeof appearance.themes)[keyof typeof appearance.themes];

function kebabCase(value: string): string {
  return value.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

function declarations(vars: Iterable<[string, string]>): string {
  return [...vars].map(([name, value]) => `  ${name}: ${value};`).join("\n");
}

function paletteVars(theme: Theme): [string, string][] {
  const vars: [string, string][] = [];

  for (const [name, value] of Object.entries(theme.colors)) {
    if (name === "admonitions") continue;
    vars.push([`--color-${kebabCase(name)}`, value]);
  }

  for (const [kind, colors] of Object.entries(theme.colors.admonitions)) {
    vars.push([`--color-adm-${kind}-bg`, colors.bg]);
    vars.push([`--color-adm-${kind}-border`, colors.border]);
    vars.push([`--color-adm-${kind}-text`, colors.text]);
  }

  return vars;
}

function baseVars(): [string, string][] {
  return [
    ["--max-width", appearance.maxWidth],
    ["--max-width-full", appearance.maxWidthFull],
    ["--font-size", appearance.fontSize],
    ["--font-size-mobile", appearance.mobileFontSize],
    ["--line-height", String(appearance.lineHeight)],
    ["--font-body", appearance.fonts.body],
    ["--font-heading", appearance.fonts.heading],
    ["--font-mono", appearance.fonts.mono],
  ];
}

/**
 * Builds the theme block injected by BaseLayout.
 *
 * Keeping the palettes in `src/config.ts` means the colors used by the page,
 * the colored text markers and the theme switch all come from one place.
 */
export function buildThemeCss(): string {
  const blocks: string[] = [];
  const light = appearance.themes.light;

  blocks.push(
    `:root {\n${declarations([...baseVars(), ...paletteVars(light)])}\n  color-scheme: ${light.colorScheme};\n}`,
  );

  for (const [name, theme] of Object.entries(appearance.themes)) {
    if (name === "light") continue;

    blocks.push(
      `[data-theme="${name}"] {\n${declarations(paletteVars(theme))}\n  color-scheme: ${theme.colorScheme};\n}`,
    );

    if ("codeFrame" in theme) {
      blocks.push(
        `[data-theme="${name}"] .expressive-code {\n${declarations(Object.entries(theme.codeFrame))}\n}`,
      );
    }

    if ("syntaxFilter" in theme) {
      blocks.push(
        `[data-theme="${name}"] .expressive-code pre > code {\n  filter: ${theme.syntaxFilter};\n}`,
      );
    }
  }

  return blocks.join("\n\n");
}
