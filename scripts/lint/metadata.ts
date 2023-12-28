// @deno-types="@/types/usercss-meta.d.ts";
import usercssMeta from "usercss-meta";
import * as color from "std/fmt/colors.ts";
import type { WalkEntry } from "std/fs/walk.ts";
import { relative } from "std/path/mod.ts";

import { REPO_ROOT } from "@/deps.ts";
import { log } from "@/lint/logger.ts";
import { getUserstylesData } from "@/utils.ts";

export const verifyMetadata = async (
  entry: WalkEntry,
  content: string,
  repo: string,
) => {
  const assert = await assertions(repo);
  const file = relative(REPO_ROOT, entry.path);

  const { metadata, errors: parsingErrors } = usercssMeta.parse(content, {
    allowErrors: true,
  });

  // Pretty print / annotate the parsing errors.
  parsingErrors.map((e) => {
    let startLine = 0;
    for (const line of content.split("\n")) {
      startLine++;
      e.index -= line.length + 1;
      if (e.index < 0) break;
    }
    log(e.message, { file, startLine, content });
  });

  for (const [key, value] of Object.entries(assert)) {
    const defacto = metadata[key];
    if (defacto !== value) {
      const line = content
        .split("\n")
        .findIndex((line) => line.includes(key)) + 1;

      const message = `Metadata ${color.bold(key)} should be ${
        color.green(value)
      } but is ${color.red(String(defacto))}`;

      log(message, {
        file,
        startLine: line !== 0 ? line : undefined,
        content,
      }, "warning");
    }
  }

  // Parse the UserCSS variables to LESS global variables, e.g.
  // `@var select lightFlavor "Light Flavor" ["latte:Latte*", "frappe:Frappé", "macchiato:Macchiato", "mocha:Mocha"]`
  // gets parsed as
  // `lightFlavor: "latte"`.
  const globalVars = Object.entries(metadata.vars)
    .reduce((acc, [k, v]) => {
      return { ...acc, [k]: v.default };
    }, {});

  return {
    globalVars,
    isLess: metadata.preprocessor === assert.preprocessor,
  };
};

const assertions = async (repo: string) => {
  const prefix = "https://github.com/catppuccin/userstyles";

  const { userstyles } = await getUserstylesData().catch((err) => {
    console.error(err);
    Deno.exit(1);
  });

  return {
    name: `${
      Array.isArray(userstyles[repo].name)
        ? (userstyles[repo].name as string[]).join("/")
        : userstyles[repo].name
    } Catppuccin`,
    namespace: `github.com/catppuccin/userstyles/styles/${repo}`,
    author: "Catppuccin",
    license: "MIT",
    preprocessor: "less",
    homepageURL: `${prefix}/tree/main/styles/${repo}`,
    updateURL: `${prefix}/raw/main/styles/${repo}/catppuccin.user.css`,
    supportURL: `${prefix}/issues?q=is%3Aopen+is%3Aissue+label%3A${repo}`,
  };
};
