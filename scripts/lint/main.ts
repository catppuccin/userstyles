import { REPO_ROOT } from "@/constants.ts";

import { parseArgs } from "@std/cli";
import * as path from "@std/path";
// @ts-types="npm:@types/less";
import less from "less";

import { checkForMissingFiles } from "@/lint/file-checker.ts";
import { log } from "@/logger.ts";
import { verifyMetadata } from "@/lint/metadata.ts";
import { runStylelint } from "@/lint/stylelint.ts";
import { getUserstylesData, getUserstylesFiles } from "@/utils.ts";
import stylelintConfig from "../../.stylelintrc.js";

const args = parseArgs(Deno.args, { boolean: ["fix"] });
const userstyle = args._[0]?.toString().match(
  /(?<base>styles\/)?(?<userstyle>[a-z0-9_\-.]+)(?<trailing>\/)?(?<file>catppuccin\.user\.less)?/,
)?.groups?.userstyle;
const stylesheets = userstyle
  ? [path.join(REPO_ROOT, "styles", userstyle, "catppuccin.user.less")]
  : getUserstylesFiles();

const { userstyles } = getUserstylesData();

let didLintFail = false;

for (const style of stylesheets) {
  const dir = path.basename(path.dirname(style));
  const file = path.relative(REPO_ROOT, style);

  let content = await Deno.readTextFile(style);

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
  await runStylelint(style, content, args.fix, stylelintConfig).catch(() =>
    didLintFail = true
  );
}

if (await checkForMissingFiles() === false) didLintFail = true;

// Cause the workflow to fail if any issues were found.
if (didLintFail || log.failed) Deno.exit(1);
