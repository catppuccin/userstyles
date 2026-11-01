import { styleText } from "node:util";

import "postcss-less";
import stylelint from "stylelint";
import "stylelint-config-standard";
import "stylelint-config-recommended";

import { log } from "#/utils/logger.ts";

export async function runStylelint(
  file: string,
  content: string,
  fix: boolean,
  config: stylelint.Config,
): Promise<{ code: string | undefined; hasWarnings: boolean }> {
  let hasWarnings = false;

  const { results, code } = await stylelint.lint({
    code: content,
    config,
    fix,
  });

  for (const result of results) {
    for (const warning of result.warnings) {
      // Some cleanup for fancier logging - dims the rule name.
      const message = warning.text?.replace(
        new RegExp(`\\(?${warning.rule}\\)?`),
        styleText("dim", `(${warning.rule})`),
      ) ?? "unspecified stylelint error";

      log.log(message, {
        file,
        startLine: warning.line,
        endLine: warning.endLine,
        startColumn: warning.column,
        endColumn: warning.endColumn,
        content,
      }, warning.severity);
    }

    if (result.warnings.length > 0) hasWarnings = true;
  }

  return { code, hasWarnings };
}
