import { REPO_ROOT } from "@/constants.ts";

import { parseArgs } from "@std/cli";
import * as path from "@std/path";
import * as color from "@std/fmt/colors";

import { log } from "@/logger.ts";
import { validateUserCSSMetadata } from "@/lint/metadata.ts";
import compile from "@/lint/compile.ts";
import stylelint from "@/lint/stylelint.ts";
import {
  getUserstylePath,
  getUserstylesData,
  getUserstylesFiles,
  parseUserstyleArg,
} from "@/utils.ts";

const args = parseArgs(Deno.args, { boolean: ["fix"] });
const userstyle = parseUserstyleArg(args._[0]);
const stylesheets = userstyle
  ? [getUserstylePath(userstyle)]
  : getUserstylesFiles();

const { userstyles } = getUserstylesData();

const settlements: PromiseSettledResult<unknown>[] = [];

for (const style of stylesheets) {
  const dir = path.basename(path.dirname(style));
  const file = path.relative(REPO_ROOT, style);

  let content = await Deno.readTextFile(style);

  // Verify the UserCSS metadata.
  const { vars, isLess, fixed } = validateUserCSSMetadata(
    file,
    content,
    dir,
    userstyles,
    args.fix,
  );

  content = fixed;

  // Don't attempt to compile or lint non-LESS files.
  if (!isLess) continue;

  // Compile the LESS file and lint with Stylelint.
  const [compiled, linted] = await Promise.allSettled([
    compile(file, content, vars),
    stylelint(style, content, args.fix),
  ]);
  settlements.push(compiled, linted);

  Deno.writeTextFileSync(
    file,
    (linted.status === "fulfilled" ? linted.value : undefined) ?? content,
  );
}

// Cause the workflow to fail if any issues were found.

const THIN_SPACE = "\u2009";

if (
  settlements.some((result) => result.status === "rejected") || log.failed
) {
  if (!args.fix) {
    console.log(
      `\n  ${
        color.bold(color.inverse(color.green(`${THIN_SPACE}TIP${THIN_SPACE}`)))
      } Run ${color.bold("deno task lint:fix")} to fix autofixable issues.`,
    );
  }
  Deno.exit(1);
}
