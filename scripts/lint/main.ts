import type { Userstyles } from "#/types/userstyles.d.ts";
import { REPO_ROOT, STYLES_ROOT } from "#/constants.ts";

import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { checkLess } from "#/lint/less.ts";
import { checkMetadata } from "#/lint/metadata.ts";
import { checkRepository } from "#/lint/repository.ts";
import { checkStylelint } from "#/lint/stylelint.ts";
import { type Diagnostic, report } from "#/utils/diagnostics.ts";
import {
  getUserstylesFiles,
  loadUserstylesData,
  parseUserstyleArgument,
} from "#/utils/data.ts";
import stylelintConfig from "../../.stylelintrc.js";
import { style } from "#/utils/style.ts";

const { values: args, positionals } = parseArgs({
  options: { fix: { type: "boolean", default: false } },
  allowPositionals: true,
});
const userstyle = parseUserstyleArgument(positionals[0]);
const slugs = userstyle
  ? [userstyle]
  : getUserstylesFiles().map((file) => path.basename(path.dirname(file)));

/**
 * Run every check on a given userstyle, and write the fixed content to disk if `fix` is enabled.
 * Errors are reported as diagnostics, checks never throw or exit.
 */
async function lintUserstyle(
  slug: string,
  userstyles: Userstyles,
  fix: boolean,
): Promise<Diagnostic[]> {
  const absolutePath = path.join(STYLES_ROOT, slug, "catppuccin.user.less");
  const file = path.relative(REPO_ROOT, absolutePath);

  if (!existsSync(absolutePath)) {
    return [{ file, message: "File does not exist.", severity: "error" }];
  }

  const diagnostics: Diagnostic[] = [];
  try {
    const original = await readFile(absolutePath, "utf8");
    // `usercss-meta` prohibits any '\r' characters, which seem to be present on Windows.
    const crlf = original.includes("\r\n");
    let content = original.replaceAll("\r\n", "\n");

    const metadata = await checkMetadata(
      file,
      content,
      slug,
      userstyles,
      fix,
    );
    diagnostics.push(...metadata.diagnostics);
    content = metadata.content; // possibly corrected file content

    // Don't attempt to compile or lint non-LESS files.
    if (metadata.isLess) {
      const stylelint = await checkStylelint(
        file,
        content,
        fix,
        stylelintConfig,
      );
      diagnostics.push(...stylelint.diagnostics);
      content = stylelint.content;

      diagnostics.push(...await checkLess(file, content, metadata.globalVars));
    }

    if (fix) {
      const output = crlf ? content.replaceAll("\n", "\r\n") : content;
      if (output !== original) await writeFile(absolutePath, output);
    }
  } catch (err) {
    diagnostics.push({
      file,
      message: `Unexpected error while linting:\n${
        err instanceof Error ? err.stack ?? err.message : String(err)
      }`,
      severity: "error",
    });
  }
  return diagnostics;
}

const diagnostics: Diagnostic[] = [];

const userstyles = loadUserstylesData();
diagnostics.push(...userstyles.diagnostics);

if (userstyles.data) {
  if (!userstyle) {
    diagnostics.push(...checkRepository(userstyles.data.userstyles));
  }

  for (const slug of slugs) {
    diagnostics.push(
      ...await lintUserstyle(slug, userstyles.data.userstyles, args.fix),
    );
  }
}

report(diagnostics);

// Cause the workflow to fail if any issues were found.

const THIN_SPACE = " "; // \u2009

if (diagnostics.some(({ severity }) => severity === "error")) {
  const fixable = diagnostics.filter(({ fixable }) => fixable).length;
  if (!args.fix && fixable > 0) {
    console.log(
      `\n  ${
        style.bold(style.inverse(style.green(`${THIN_SPACE}TIP${THIN_SPACE}`)))
      } Run ${
        style.bold("pnpm lint:fix")
      } to fix (${fixable}) autofixable issues.\n`,
    );
  }
  process.exitCode = 1;
}
