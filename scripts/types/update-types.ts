import { REPO_ROOT, USERSTYLES_SCHEMA } from "@/constants.ts";

import * as path from "@std/path";
import { compile, type JSONSchema } from "json-schema-to-typescript";

const TYPES_ROOT = path.join(REPO_ROOT, "scripts/types");

const types = await compile(
  USERSTYLES_SCHEMA as JSONSchema,
  "UserstylesSchema",
  {
    bannerComment: "// deno-fmt-ignore-file",
  },
);
Deno.writeTextFileSync(path.join(TYPES_ROOT, "userstyles.d.ts"), types);
