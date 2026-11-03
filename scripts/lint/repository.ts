import type { Userstyles } from "#/types/userstyles.d.ts";
import { REPO_ROOT, STYLES_ROOT } from "#/constants.ts";

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

import type { Diagnostic } from "#/utils/diagnostics.ts";
import { USERSTYLES_FILE } from "#/utils/data.ts";
import { style } from "#/utils/style.ts";

/**
 * Check that every userstyle in `userstyles.yml` has a directory in `styles/`.
 * (The reverse is checked for each by the metadata check.)
 */
export function checkRepository(userstyles: Userstyles): Diagnostic[] {
  const content = readFileSync(path.join(REPO_ROOT, USERSTYLES_FILE), "utf8");
  const lines = content.split("\n");

  return Object.keys(userstyles)
    .filter((slug) => !existsSync(path.join(STYLES_ROOT, slug)))
    .map((slug) => {
      const line = lines.findIndex((line) => line === `  ${slug}:`) + 1;
      return {
        file: USERSTYLES_FILE,
        message: `Userstyle \`${
          style.bold(slug)
        }\` has no \`styles/${slug}\` directory.`,
        severity: "error",
        span: line !== 0 ? { line: { start: line } } : undefined,
        content,
      };
    });
}
