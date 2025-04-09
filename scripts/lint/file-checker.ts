import { REPO_ROOT } from "../constants.ts";

import * as path from "@std/path";
import core from "@actions/core";

import { log } from "../logger.ts";
import { readDir } from "../utils/fs.ts";
import fs from 'node:fs';

const requiredFiles = [
  "catppuccin.user.less",
];

export async function checkForMissingFiles() {
  const stylesRoot = path.join(REPO_ROOT, "styles");

  const missingFiles: string[] = [];
  for (const entry of await readDir(stylesRoot)) {
    if (!entry.isDirectory()) continue;
    const styleRoot = path.join(stylesRoot, entry.name);

    await Promise.all(requiredFiles.map(async (f) => {
      const fp = path.join(styleRoot, f);
      const rfp = path.relative(REPO_ROOT, fp);

      if (!(fs.existsSync(fp))) {
        missingFiles.push(rfp);
      }
    }));
  }

  // Only write summary if running in GitHub Actions.
  if (process.env["GITHUB_ACTIONS"]) {
    await core.summary
      .addHeading("Missing files")
      .addList(missingFiles)
      .write();
  } else {
    for (const file of missingFiles) {
      log.error(`File does not exist`, { file });
    }
  }

  return missingFiles.length === 0;
}
