import * as color from "std/fmt/colors.ts";
import type { WalkEntry } from "std/fs/walk.ts";
import { relative } from "std/path/mod.ts";

import "postcss-less";
import stylelint from "stylelint";
import "stylelint-config-standard";
import "stylelint-config-recommended";

import { REPO_ROOT } from "@/deps.ts";
import { log } from "@/lint/logger.ts";

export const lint = (
  entry: WalkEntry,
  content: string,
  fix: boolean,
  config: stylelint.Config,
) =>
  stylelint.lint({ code: content, config, fix })
    .then(({ results, code }) => {
      if (code) {
        Deno.writeTextFileSync(entry.path, code);
      }
      results.map((result) => {
        result.warnings.map((warning) => {
          // Some cleanup for fancier logging - dims the rule name.
          const message = warning.text?.replace(
            new RegExp(`\\(?${warning.rule}\\)?`),
            color.dim(`(${warning.rule})`),
          ) ?? "unspecified stylelint error";

          log(message, {
            file: relative(REPO_ROOT, entry.path),
            startLine: warning.line,
            endLine: warning.endLine,
            startColumn: warning.column,
            endColumn: warning.endColumn,
            content,
          }, warning.severity);
        });

        if (result.warnings.length > 0) throw new Error("stylelint error");
      });
    });
