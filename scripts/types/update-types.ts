import { REPO_ROOT, USERSTYLES_SCHEMA } from "#/constants.ts";

import { writeFileSync } from "node:fs";

import path from "node:path";
import { compile, type JSONSchema } from "json-schema-to-typescript";

const TYPES_ROOT = path.join(REPO_ROOT, "scripts/types");

const types = await compile(
  USERSTYLES_SCHEMA as JSONSchema,
  "UserstylesSchema",
  {
    bannerComment: "// dprint-ignore-file",
  },
);
writeFileSync(path.join(TYPES_ROOT, "userstyles.d.ts"), types);
