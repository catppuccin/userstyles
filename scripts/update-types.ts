#!/usr/bin/env -S deno run -A
// deno-lint-ignore-file no-explicit-any
import * as path from "@std/path";
import { compile, Options } from "json-schema-to-typescript";
import { REPO_ROOT, userStylesSchema } from "@/deps.ts";

const options = {
  bannerComment: "// deno-fmt-ignore-file",
} satisfies Partial<Options>;

const TYPES_ROOT = path.join(REPO_ROOT, "scripts/types");

compile(userStylesSchema as any, "UserstylesSchema", options)
  .then((ts) =>
    Deno.writeTextFileSync(path.join(TYPES_ROOT, "userstyles.d.ts"), ts)
  );
