import path from "node:path";

import { compile, type JSONSchema } from "json-schema-to-typescript";

import { REPO_ROOT, USERSTYLES_SCHEMA } from "../constants.ts";
import { writeTextFileSync } from "../utils/fs.ts";

const TYPES_ROOT = path.join(REPO_ROOT, "scripts/types");

const types = await compile(
  USERSTYLES_SCHEMA as JSONSchema,
  "UserstylesSchema",
  {
    bannerComment: "// deno-fmt-ignore-file",
  },
);
writeTextFileSync(path.join(TYPES_ROOT, "userstyles.d.ts"), types);
