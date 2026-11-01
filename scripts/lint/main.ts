import { REPO_ROOT, STYLES_ROOT } from "#/constants.ts";

import { existsSync, writeFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs, styleText } from "node:util";

import less from "less";

import { log } from "#/utils/logger.ts";
import { verifyMetadata } from "#/lint/metadata.ts";
import { runStylelint } from "#/lint/stylelint.ts";
import {
  getUserstylesData,
  getUserstylesFiles,
  parseUserstyleArgument,
} from "#/utils/data.ts";
import stylelintConfig from "../../.stylelintrc.js";
import "#/lint/library.ts";

const { values: args, positionals } = parseArgs({
  options: { fix: { type: "boolean", default: false } },
  allowPositionals: true,
});
const userstyle = parseUserstyleArgument(positionals[0]);
const stylesheets = userstyle
  ? [path.join(STYLES_ROOT, userstyle, "catppuccin.user.less")]
  : getUserstylesFiles();

const { userstyles } = getUserstylesData();

let didLintFail = false;

for (const style of stylesheets) {
  const dir = path.basename(path.dirname(style));
  const file = path.relative(REPO_ROOT, style);

  if (!existsSync(style)) {
    log.error("File does not exist", { file });
    continue;
  }

  let content = await readFile(style, "utf8");

  // Verify the UserCSS metadata.
  const { globalVars, isLess, fixed } = await verifyMetadata(
    file,
    content,
    dir,
    userstyles,
    args.fix,
  );

  content = fixed;

  // Don't attempt to compile or lint non-LESS files.
  if (!isLess) continue;

  // Try to compile the LESS file, report any errors.
  less.render(content, { lint: true, globalVars: globalVars }).catch(
    (err: Less.RenderError) => {
      didLintFail = true;
      log.error(
        err.message,
        { file, startLine: err.line, endLine: err.line, content },
      );
    },
  );

  // Lint with Stylelint.
  const { code, hasWarnings } = await runStylelint(
    style,
    content,
    args.fix,
    stylelintConfig,
  );
  if (hasWarnings) didLintFail = true;
  writeFileSync(file, code ?? content);
}

// Cause the workflow to fail if any issues were found.

const THIN_SPACE = "\u2009";

if (didLintFail || log.failed) {
  if (!args.fix) {
    console.log(
      `\n  ${
        styleText(
          ["bold", "inverse", "green"],
          `${THIN_SPACE}TIP${THIN_SPACE}`,
        )
      } Run ${styleText("bold", "pnpm lint:fix")} to fix autofixable issues.`,
    );
  }
  process.exitCode = 1;
}
