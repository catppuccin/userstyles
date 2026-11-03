import { styleText } from "node:util";

const formats = [
  "bold",
  "dim",
  "underline",
  "inverse",
  "red",
  "green",
  "yellow",
] as const;

/**
 * Shorthand for `styleText`, to simplify the API to e.g. `style.bold(text)`.
 */
export const style = Object.fromEntries(
  formats.map((format) => [format, (text: string) => styleText(format, text)]),
) as Record<(typeof formats)[number], (text: string) => string>;
