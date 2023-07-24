#!/usr/bin/env -S deno run --allow-read --allow-write

import * as path from "https://deno.land/std@0.194.0/path/mod.ts";
import core from "npm:@actions/core";
import less from "npm:less";
import usercssMeta from "npm:usercss-meta";
import { globber } from "https://deno.land/x/globber@0.1.0/mod.ts";

const iterator = globber({
  include: ["styles/**/catppuccin.user.css"],
});

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
  Deno.readTextFile(entry.absolute).then((css) => {
    const repo = path.basename(path.dirname(entry.absolute));

    let metadata: Record<string, any> = {};
    try {
      metadata = usercssMeta.parse(css).metadata;
    } catch (err) {
      core.error(err, { file: entry.relative });
    }

    const assert = assertions(repo);

    Object.entries(assert).forEach(([k, v]) => {
      const defacto = metadata[k];
      if (defacto !== v) {
        const line = css.split("\n").findIndex((line) => line.includes(k)) + 1;
        core.warning(`Metadata ${k} should be ${v} but is ${defacto}`, {
          file: entry.relative,
          startLine: line !== 0 ? line : undefined,
        });
      }
    });
    // don't attempt to lint non-less files
    if (metadata.preprocessor !== assert.preprocessor) return;

    const globalVars = Object.entries(metadata.vars)
      .reduce((acc, [k, v]) => {
        return { ...acc, [k]: v.default };
      }, {});
    return less.render(css, { lint: true, globalVars }).then().catch((err) => {
      core.error(err.message, {
        file: entry.relative,
        startLine: err.line,
        endLine: err.line,
      });
    });
  });
}
