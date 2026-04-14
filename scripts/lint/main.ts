import path from "node:path";

import * as color from "@std/fmt/colors";
import less from "less";
import parseArgs from "tiny-parse-argv";

import stylelintConfig from "../../.stylelintrc.js";
import { REPO_ROOT, STYLES_ROOT } from "../constants.ts";
import { getUserstylesData, getUserstylesFiles } from "../utils/data.ts";
import { readTextFile } from "../utils/fs.ts";
import { log } from "../utils/logger.ts";

import { verifyMetadata } from "./metadata.ts";
import { runStylelint } from "./stylelint.ts";

const args = parseArgs(process.argv.slice(2), { boolean: ["fix"] });
const userstyle = args._[0]
  ?.toString()
  .match(
    /(?<base>styles\/)?(?<userstyle>[a-z0-9_\-.]+)(?<trailing>\/)?(?<file>catppuccin\.user\.less)?/,
  )?.groups?.userstyle;
const stylesheets = userstyle
  ? [path.join(STYLES_ROOT, userstyle, "catppuccin.user.less")]
  : getUserstylesFiles();

const { userstyles } = getUserstylesData();

for (const style of stylesheets) {
  const dir = path.basename(path.dirname(style));
  const file = path.relative(REPO_ROOT, style);

  let content = await readTextFile(style);

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
  less
    .render(content, { lint: true, globalVars: globalVars })
    .catch((err: Less.RenderError) => {
      log.error(err.message, {
        file,
        startLine: err.line,
        endLine: err.line,
        content,
      });
    });

  // Lint with Stylelint.
  await runStylelint(style, content, args.fix, stylelintConfig);
}

// Cause the workflow to fail if any issues were found.

const THIN_SPACE = "\u2009";

if (log.failed) {
  if (!args.fix) {
    console.log(
      `\n  ${
        color.bold(color.inverse(color.green(`${THIN_SPACE}TIP${THIN_SPACE}`)))
      } Run ${color.bold("deno task lint:fix")} to fix autofixable issues.`,
    );
  }
  process.exit(1);
}
