#!/usr/bin/env -S deno run -A

import { join } from "std/path/mod.ts";
import { compile, Options } from "npm:json-schema-to-typescript";
import { REPO_ROOT } from "@/deps.ts";

const options = {
  bannerComment: "// deno-fmt-ignore-file",
} satisfies Partial<Options>;

const TYPES_ROOT = join(REPO_ROOT, "scripts/types");

import UserStylesSchemaJSON from "./userstyles.schema.json" assert {
  type: "json",
};

compile(
  // deno-lint-ignore no-explicit-any
  UserStylesSchemaJSON as any,
  "UserstylesSchema",
  options,
).then((ts) => Deno.writeTextFileSync(join(TYPES_ROOT, "userstyles.d.ts"), ts));

fetch("https://json.schemastore.org/github-issue-forms.json")
  .then((res) => res.json())
  .then((schema) => compile(schema, "github-issue-forms.json", options))
  .then((ts) =>
    Deno.writeTextFileSync(join(TYPES_ROOT, "github-issue-forms.d.ts"), ts)
  );
