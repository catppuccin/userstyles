#!/usr/bin/env -S deno run -A
import { walk } from "std/fs/walk.ts";
import { parse as parseFlags } from "std/flags/mod.ts";
import { basename, dirname, join, relative } from "std/path/mod.ts";
// @deno-types="npm:@types/less";
import less from "less";

import { REPO_ROOT } from "@/deps.ts";
import { checkForMissingFiles } from "@/lint/file-checker.ts";
import { log } from "@/lint/logger.ts";
import { verifyMetadata } from "@/lint/metadata.ts";
import { lint } from "@/lint/stylelint.ts";
import { getUserstylesData } from "@/utils.ts";
import stylelintConfig from "../../.stylelintrc.js";

const flags = parseFlags(Deno.args, { boolean: ["fix"] });
const subDir = flags._[0]?.toString() ?? "";
const stylesheets = walk(join(REPO_ROOT, "styles", subDir), {
  includeFiles: true,
  includeDirs: false,
  includeSymlinks: false,
  match: [/\.user.css$/],
});
const { userstyles } = getUserstylesData();

let failed = false;

for await (const entry of stylesheets) {
  const dir = basename(dirname(entry.path));
  const file = relative(REPO_ROOT, entry.path);

  let content = await Deno.readTextFile(entry.path);

  // Verify the UserCSS metadata.
  const { globalVars, isLess, fixed } = await verifyMetadata(
    entry,
    content,
    dir,
    userstyles,
    flags.fix,
  );

  content = fixed;

  // Don't attempt to compile or lint non-LESS files.
  if (!isLess) continue;

  // Try to compile the LESS file, report any errors.
  less.render(content, { lint: true, globalVars: globalVars }).catch(
    (err: Less.RenderError) => {
      failed = true;
      log(
        err.message,
        { file, startLine: err.line, endLine: err.line, content },
        "error",
      );
    },
  );

  // Lint with Stylelint.
  await lint(entry, content, flags.fix, stylelintConfig).catch(() =>
    failed = true
  );
}

if (await checkForMissingFiles() === false) failed = true;

// Cause the workflow to fail if any issues were found.
if (failed) Deno.exit(1);
