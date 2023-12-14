// @deno-types="@/types/usercss-meta.d.ts";
import usercssMeta from "usercss-meta";
import { log } from "@/lint/logger.ts";
import * as color from "std/fmt/colors.ts";
import { sprintf } from "std/fmt/printf.ts";
import type { WalkEntry } from "std/fs/walk.ts";
import { relative } from "std/path/mod.ts";
import { REPO_ROOT } from "@/deps.ts";

export const verifyMetadata = (
  entry: WalkEntry,
  content: string,
  repo: string,
) => {
  const assert = assertions(repo);
  const file = relative(REPO_ROOT, entry.path);

  const { metadata, errors: parsingErrors } = usercssMeta.parse(content, {
    allowErrors: true,
  });

  // pretty print / annotate the parsing errors
  parsingErrors.map((e) => {
    let startLine = 0;
    for (const line of content.split("\n")) {
      startLine++;
      e.index -= line.length + 1;
      if (e.index < 0) break;
    }
    log(e.message, { file, startLine, content });
  });

  Object.entries(assert).forEach(([k, v]) => {
    const defacto = metadata[k];
    if (defacto !== v) {
      const line = content
        .split("\n")
        .findIndex((line) => line.includes(k)) + 1;

      const message = sprintf(
        "Metadata %s should be %s but is %s",
        color.bold(k),
        color.green(v),
        color.red(String(defacto)),
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
  const globalVars = Object.entries(metadata.vars)
    .reduce((acc, [k, v]) => {
      return { ...acc, [k]: v.default };
    }, {});

  return {
    globalVars,
    isLess: metadata.preprocessor === assert.preprocessor,
  };
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
    supportURL: `${prefix}/issues?q=is%3Aopen+is%3Aissue+label%3A${repo}`,
  };
};
