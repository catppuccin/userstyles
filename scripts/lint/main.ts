#!/usr/bin/env -S deno run -A
import { walk } from "@std/fs";
import { parseArgs } from "@std/cli";
import * as path from "@std/path";
// @ts-types="npm:@types/less";
import less from "less";

import { REPO_ROOT } from "@/constants.ts";
import { checkForMissingFiles } from "@/lint/file-checker.ts";
import { log } from "@/lint/logger.ts";
import { verifyMetadata } from "@/lint/metadata.ts";
import { lint } from "@/lint/stylelint.ts";
import { getUserstylesData } from "@/utils/yaml.ts";
import stylelintConfig from "../../.stylelintrc.js";

const args = parseArgs(Deno.args, { boolean: ["fix"] });
const subDir = args._[0]?.toString() ?? "";
const stylesheets = walk(path.join(REPO_ROOT, "styles", subDir), {
  includeFiles: true,
  includeDirs: false,
  includeSymlinks: false,
  match: [/\.user.css$/],
});
const { userstyles } = getUserstylesData();

let failed = false;

for await (const entry of stylesheets) {
  const dir = path.basename(path.dirname(entry.path));
  const file = path.relative(REPO_ROOT, entry.path);

  let content = await Deno.readTextFile(entry.path);

  // Verify the UserCSS metadata.
  const { globalVars, isLess, fixed } = await verifyMetadata(
    entry,
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
      failed = true;
      log.error(
        err.message,
        { file, startLine: err.line, endLine: err.line, content },
      );
    },
  );

  // Lint with Stylelint.
  await lint(entry, content, args.fix, stylelintConfig).catch(() =>
    failed = true
  );
}

if (await checkForMissingFiles() === false) failed = true;

// Cause the workflow to fail if any issues were found.
if (failed || log.failed) Deno.exit(1);
