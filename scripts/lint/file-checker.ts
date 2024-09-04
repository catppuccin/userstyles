import { exists } from "@std/fs";
import * as path from "@std/path";
import core from "@actions/core";

import { REPO_ROOT } from "@/constants.ts";
import { log } from "@/lint/logger.ts";
import * as color from "@std/fmt/colors";

const requiredFiles = [
  "catppuccin.user.css",
  "preview.webp",
];

export const checkForMissingFiles = async () => {
  const stylesRoot = path.join(REPO_ROOT, "styles");

  const missingFiles: string[] = [];
  for await (const entry of Deno.readDir(stylesRoot)) {
    if (!entry.isDirectory) continue;
    const styleRoot = path.join(stylesRoot, entry.name);

    await Promise.all(requiredFiles.map(async (f) => {
      const fp = path.join(styleRoot, f);
      const rfp = path.relative(REPO_ROOT, fp);

      if (!(await exists(fp))) {
        missingFiles.push(rfp);
      }
    }));
  }

  // Only write summary if running in GitHub Actions.
  if (Deno.env.has("GITHUB_ACTIONS")) {
    await core.summary
      .addHeading("Missing files")
      .addList(missingFiles)
      .write();
  } else {
    missingFiles.map((f) => {
      log.error(color.red(`Missing file:`) + ` ${f}`, { file: f });
    });
  }

  return missingFiles.length === 0;
};
