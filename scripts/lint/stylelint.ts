import * as color from "std/fmt/colors.ts";
import { WalkEntry } from "std/fs/mod.ts";
import { relative } from "std/path/mod.ts";

import "npm:postcss-less";
import stylelint from "npm:stylelint";
import "npm:stylelint-config-standard";
import "npm:stylelint-config-recommended";

import { REPO_ROOT } from "@/deps.ts";
import { log } from "@/lint/logger.ts";

export const lint = (entry: WalkEntry, content: string, fix: boolean) =>
  stylelint.lint({ files: entry.path, fix })
    .then(({ results }) => {
      results.map((result) => {
        result.warnings.map((warning) => {
          // Some cleanup for fancier logging, dims the rule name
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
