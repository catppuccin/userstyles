// TODO: remove this once types for usercss-meta are available
// deno-lint-ignore-file no-explicit-any

import chalk from "chalk";
import usercssMeta from "usercss-meta";
import { log } from "./logger.ts";
import { sprintf } from "std/fmt/printf.ts";
import type { WalkEntry } from "std/fs/mod.ts";
import { relative } from "std/path/mod.ts";
import { REPO_ROOT } from "@/deps.ts";

export const verifyMetadata = (
  entry: WalkEntry,
  content: string,
  repo: string,
): Promise<{
  globalVars: Record<string, string>;
  isLess: boolean;
}> => {
  return new Promise((resolve, reject) => {
    const assert = assertions(repo);
    const file = relative(REPO_ROOT, entry.path);

    let metadata: Record<string, any> = {};
    try {
      metadata = usercssMeta.parse(content).metadata;
    } catch (err) {
      log(err, { file }, "error");
      reject(err);
    }

    Object.entries(assert).forEach(([k, v]) => {
      const defacto = metadata[k];
      if (defacto !== v) {
        const line = content
          .split("\n")
          .findIndex((line) => line.includes(k)) + 1;

        const message = sprintf(
          "Metadata %s should be %s but is %s",
          chalk.bold(k),
          chalk.green(v),
          chalk.red(defacto),
        );

        log(message, {
          file,
          startLine: line !== 0 ? line : undefined,
          content,
        }, "warning");
      }
    });

    // parse the usercss variables to less global variables, e.g.
    // `@var select lightFlavor "Light Flavor" ["latte:Latte*", "frappe:Frappé", "macchiato:Macchiato", "mocha:Mocha"]`
    // gets parsed as
    // `lightFlavor: "latte"`

    const globalVars = Object.entries<{ default: string }>(metadata.vars)
      .reduce((acc, [k, v]) => {
        return { ...acc, [k]: v.default };
      }, {});

    resolve({
      globalVars,
      isLess: metadata.preprocessor === assert.preprocessor,
    });
  });
};

const assertions = (repo: string) => {
  const prefix = "https://github.com/catppuccin/userstyles";
  return {
    namespace: `github.com/catppuccin/userstyles/styles/${repo}`,
    author: "Catppuccin",
    license: "MIT",
    preprocessor: "less",
    homepageURL: `${prefix}/tree/main/styles/${repo}`,
    updateURL: `${prefix}/raw/main/styles/${repo}/catppuccin.user.css`,
  };
};
