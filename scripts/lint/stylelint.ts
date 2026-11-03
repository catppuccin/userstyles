import "postcss-less";
import stylelint from "stylelint";
import "stylelint-config-standard";
import "stylelint-config-recommended";

import type { Diagnostic } from "#/utils/diagnostics.ts";
import { style } from "#/utils/style.ts";

/**
 * Lint a userstyle with Stylelint. When `fix` is set, the returned content has all (autofixable) problems fixed.
 */
export async function checkStylelint(
  file: string,
  content: string,
  fix: boolean,
  config: stylelint.Config,
): Promise<{ diagnostics: Diagnostic[]; content: string }> {
  const diagnostics: Diagnostic[] = [];

  const { results, code } = await stylelint.lint({
    code: content,
    config,
    fix,
    // Marks fixable problems with edit info (`warning.fix`) when not fixing.
    computeEditInfo: !fix,
  });

  for (const result of results) {
    for (const warning of result.warnings) {
      const message = (warning.text?.replace(
        new RegExp(`\\(?${warning.rule}\\)?`),
        style.dim(`(${warning.rule})`), // dim the rule name for fancy logging
      ) ?? "Unspecified stylelint error") + ".";

      diagnostics.push({
        file,
        message,
        severity: warning.severity,
        span: {
          line: { start: warning.line, end: warning.endLine },
          column: { start: warning.column, end: warning.endColumn },
        },
        content,
        // When fixing, every remaining problem is one that couldn't be fixed.
        fixable: warning.fix !== undefined,
      });
    }
  }

  // Computing edit info applies fixes to stylelint's copy of the code, so only use its output when fixing.
  return { diagnostics, content: fix ? code ?? content : content };
}
