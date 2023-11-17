#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-sys=uid,gid

// TODO: remove this once types for usercss-meta are available
// deno-lint-ignore-file no-explicit-any

import { parse as parseFlags } from "std/flags/mod.ts";
import { basename, dirname, join, relative } from "std/path/mod.ts";
import { globber } from "globber";

import core from "@actions/core";
import chalk from "chalk";
// @deno-types="npm:@types/less";
import less from "less";
import usercssMeta from "usercss-meta";
import { lint } from "./stylelint.ts";
import { REPO_ROOT } from "@/deps.ts";
import { log, LoggerProps } from "./logger.ts";

const flags = parseFlags(Deno.args, { boolean: ["fix"] });

const iterator = globber({
  include: ["styles/**/catppuccin.user.css"],
  cwd: REPO_ROOT,
});

const missingFiles: string[] = [];

const assertions = (repo: string) => {
  const pfx = "https://github.com/catppuccin/userstyles";
  return {
    namespace: `github.com/catppuccin/userstyles/styles/${repo}`,
    author: "Catppuccin",
    license: "MIT",
    preprocessor: "less",
    homepageURL: `${pfx}/tree/main/styles/${repo}`,
    updateURL: `${pfx}/raw/main/styles/${repo}/catppuccin.user.css`,
  };
};

for await (const entry of iterator) {
  const repodir = dirname(entry.absolute);
  const repo = basename(repodir);

  const content = await Deno.readTextFile(entry.absolute);

  let metadata: Record<string, any> = {};
  try {
    metadata = usercssMeta.parse(content).metadata;
  } catch (err) {
    log(err, { file: entry.relative, content }, "error");
  }

  const assert = assertions(repo);

  Object.entries(assert).forEach(([k, v]) => {
    const defacto = metadata[k];
    if (defacto !== v) {
      const line = content.split("\n").findIndex((line) => line.includes(k)) +
        1;

      log(
        [
          "Metadata",
          chalk.bold(k),
          "should be",
          chalk.green(v),
          "but is",
          chalk.red(defacto),
        ].join(" "),
        {
          file: entry.relative,
          startLine: line !== 0 ? line : undefined,
          content,
        },
        "warning",
      );
    }
  });

  // don't attempt to compile or lint non-less files
  if (metadata.preprocessor !== assert.preprocessor) continue;

  const globalVars = Object.entries(metadata.vars)
    .reduce((acc, [k, v]) => {
      // @ts-expect-error untyped
      return { ...acc, [k]: v.default };
    }, {});

  less.render(content, { lint: true, globalVars }).then().catch(
    (err: any) => {
      log(
        err.message,
        {
          file: entry.relative,
          startLine: err.line,
          endLine: err.line,
          content,
        },
        "error",
      );
    },
  );

  lint(entry.absolute, flags.fix).then(({ results }) => {
    results.sort(
      (a, b) => (a.source ?? "").localeCompare(b.source ?? ""),
    ).map((result) => {
      result.warnings.map((warning) => {
        const msg = warning.text?.replace(
          new RegExp(`\\(?${warning.rule}\\)?`),
          chalk.dim(`(${warning.rule})`),
        ) ??
          "unspecified stylelint error";

        const props = {
          file: entry.relative,
          startLine: warning.line,
          endLine: warning.endLine,
          startColumn: warning.column,
          endColumn: warning.endColumn,
          content,
        } satisfies LoggerProps;

        log(msg, props, warning.severity);
      });
    });
  });

  [
    "catppuccin.user.css",
    ...["latte", "frappe", "macchiato", "mocha", "catwalk"].map((f) =>
      `assets/${f}.webp`
    ),
  ].map(async (fp) => {
    const filepath = join(repodir, fp);
    await Deno.stat(join(repodir, fp)).catch(() => {
      missingFiles.push(relative(REPO_ROOT, filepath));
    });
  });
}

// only write summary if running in github actions
if (Deno.env.has("GITHUB_ACTIONS") && missingFiles.length !== 0) {
  await core.summary.addHeading("Missing files").addList(missingFiles).write();
  Deno.exit(1);
}
