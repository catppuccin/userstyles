import { exists } from "std/fs/exists.ts";
import { join, relative } from "std/path/mod.ts";
import core from "@actions/core";

import { REPO_ROOT } from "@/deps.ts";
import { log } from "@/lint/logger.ts";
import * as color from "std/fmt/colors.ts";

const requiredFiles = [
  "catppuccin.user.css",
  "preview.webp",
];

export const checkForMissingFiles = async () => {
  const stylesRoot = join(REPO_ROOT, "styles");

  const missingFiles: string[] = [];
  for await (const entry of Deno.readDir(stylesRoot)) {
    if (!entry.isDirectory) continue;
    const styleRoot = join(stylesRoot, entry.name);

    await Promise.all(requiredFiles.map(async (f) => {
      const fp = join(styleRoot, f);
      const rfp = relative(REPO_ROOT, fp);

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
      log(color.red(`Missing file:`) + ` ${f}`, { file: f }, "error");
    });
  }

  return missingFiles.length === 0;
};
