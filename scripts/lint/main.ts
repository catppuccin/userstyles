#!/usr/bin/env -S deno run -A

import { walk } from "std/fs/walk.ts";
import { parse as parseFlags } from "std/flags/mod.ts";
import { basename, dirname, join, relative } from "std/path/mod.ts";

// @deno-types="npm:@types/less";
import less from "less";

import { REPO_ROOT } from "@/deps.ts";
import { checkForMissingFiles } from "./file-checker.ts";
import { log } from "./logger.ts";
import { verifyMetadata } from "./metadata.ts";
import { lint } from "./stylelint.ts";

const flags = parseFlags(Deno.args, { boolean: ["fix"] });
const subDir = flags._[0]?.toString() ?? "";
const stylesheets = walk(join(REPO_ROOT, "styles", subDir), {
  includeFiles: true,
  includeDirs: false,
  includeSymlinks: false,
  match: [/\.user.css$/],
});

for await (const entry of stylesheets) {
  const repodir = dirname(entry.path);
  const repo = basename(repodir);
  const file = relative(REPO_ROOT, entry.path);

  const content = await Deno.readTextFile(entry.path);

  // verify the usercss metadata
  const { globalVars, isLess } = verifyMetadata(entry, content, repo);
  // don't attempt to compile or lint non-less files
  if (!isLess) continue;

  // try to compile the less file, report any errors
  less.render(content, { lint: true, globalVars }).then().catch(
    (err) => {
      log(
        err.message,
        { file, startLine: err.line, endLine: err.line, content },
        "error",
      );
    },
  );

  // advanced linting with stylelint
  lint(entry, content, flags.fix);
}

// if any files are missing, cause the workflow to fail
if (await checkForMissingFiles() === false) {
  Deno.exit(1);
}
