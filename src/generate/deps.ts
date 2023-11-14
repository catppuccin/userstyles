export type { Categories as PortCategories } from "catppuccin-repo/resources/generate/types.d.ts";

export * as path from "std/path/mod.ts";
export * as assert from "std/assert/mod.ts";
export { walkSync } from "std/fs/walk.ts";
export { parse as parseYaml } from "std/yaml/parse.ts";
export * from "npm:@octokit/rest@20.0.2";

import Ajv from "npm:ajv@8.12.0";
import schema from "../userstyles.schema.json" assert { type: "json" };
import portsSchema from "catppuccin-repo/resources/ports.schema.json" assert { type: "json" };

export { Ajv, portsSchema, schema };
