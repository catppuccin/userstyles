import * as color from "@std/fmt/colors";
import stylelint from "stylelint";

import { writeTextFileSync } from "../utils/fs.ts";
import { log } from "../utils/logger.ts";

export async function runStylelint(
  file: string,
  content: string,
  fix: boolean,
  config: stylelint.Config,
): Promise<void> {
  const { results, code } = await stylelint.lint({
    code: content,
    config,
    fix,
  });

  if (code) {
    writeTextFileSync(file, code);
  }

  for (const result of results) {
    for (const warning of result.warnings) {
      // Some cleanup for fancier logging - dims the rule name.
      const message =
        warning.text?.replace(
          new RegExp(`\\(?${warning.rule}\\)?`),
          color.dim(`(${warning.rule})`),
        ) ?? "unspecified stylelint error";

      log.log(
        message,
        {
          file,
          startLine: warning.line,
          endLine: warning.endLine,
          startColumn: warning.column,
          endColumn: warning.endColumn,
          content,
        },
        warning.severity,
      );
    }
  }
}
