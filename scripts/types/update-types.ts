import * as path from "@std/path";
import { compile, type JSONSchema } from "json-schema-to-typescript";
import { REPO_ROOT, userStylesSchema } from "@/deps.ts";

const TYPES_ROOT = path.join(REPO_ROOT, "scripts/types");

const types = await compile(
  userStylesSchema as JSONSchema,
  "UserstylesSchema",
  {
    bannerComment: "// deno-fmt-ignore-file",
  },
);
Deno.writeTextFileSync(path.join(TYPES_ROOT, "userstyles.d.ts"), types);
