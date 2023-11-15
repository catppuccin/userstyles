#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-sys=uid,gid

// TODO: remove this once types for usercss-meta are available
// deno-lint-ignore-file no-explicit-any

import { basename, dirname, join } from "std/path/mod.ts";
import { globber } from "globber";

import core, { summary } from "@actions/core";
// @deno-types="npm:@types/less";
import less from "less";
import usercssMeta from "usercss-meta";
import { lint } from "./stylelint.ts";
import { REPO_ROOT } from "@/deps.ts";

const iterator = globber({
  include: ["styles/**/catppuccin.user.css"],
  cwd: REPO_ROOT,
});

let total_missing_files = 0;

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
    core.error(err, { file: entry.relative });
  }

  const assert = assertions(repo);

  Object.entries(assert).forEach(([k, v]) => {
    const defacto = metadata[k];
    if (defacto !== v) {
      const line = content.split("\n").findIndex((line) => line.includes(k)) +
        1;
      core.warning(`Metadata \`${k}\` should be ${v} but is \`${defacto}\``, {
        file: entry.relative,
        startLine: line !== 0 ? line : undefined,
      });
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
      core.error(err.message, {
        file: entry.relative,
        startLine: err.line,
        endLine: err.line,
      });
    },
  );

  lint(content).then(({ results }) => {
    results.sort(
      (a, b) => (a.source ?? "").localeCompare(b.source ?? ""),
    ).map((result) => {
      result.warnings.map((warning) => {
        core.warning(warning.text ?? "unspecified", {
          file: entry.relative,
          startLine: warning.line,
          endLine: warning.endLine,
          startColumn: warning.column,
          endColumn: warning.endColumn,
        });
      });
    });
  });

  const missing_files: string[] = [];
  [
    "catppuccin.user.css",
    ...["latte", "frappe", "macchiato", "mocha", "catwalk"].map((f) =>
      `assets/${f}.webp`
    ),
  ].map(async (fp) => {
    await Deno.stat(join(repodir, fp)).catch(() => {
      missing_files.push(fp);
      total_missing_files++;
    });
  });

  if (missing_files.length !== 0) {
    summary.addHeading("Missing Files");
    summary.addList(missing_files, true);
  }
}

// only write summary if running in github actions
if (Deno.env.has("GITHUB_STEP_SUMMARY")) {
  summary.write();
}

// missing files are a fatal error
if (total_missing_files !== 0) {
  core.error(`Found ${total_missing_files} missing files`);
}
