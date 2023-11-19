#!/usr/bin/env -S deno run -A
// deno-lint-ignore-file no-explicit-any
import { join } from "std/path/mod.ts";
import { compile, Options } from "npm:json-schema-to-typescript";
import { gitHubIssueFormsSchema, REPO_ROOT, userStylesSchema } from "@/deps.ts";

const options = {
  bannerComment: "// deno-fmt-ignore-file",
} satisfies Partial<Options>;

const TYPES_ROOT = join(REPO_ROOT, "scripts/types");

compile(userStylesSchema as any, "UserstylesSchema", options)
  .then((ts) =>
    Deno.writeTextFileSync(join(TYPES_ROOT, "userstyles.d.ts"), ts)
  );

compile(gitHubIssueFormsSchema as any, "github-issue-forms.json", options)
  .then((ts) =>
    Deno.writeTextFileSync(join(TYPES_ROOT, "github-issue-forms.d.ts"), ts)
  );
