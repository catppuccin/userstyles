export type { Categories as PortCategories } from "https://raw.githubusercontent.com/catppuccin/catppuccin/cad3fe6c9eb2476f9787c386a6b9c70de8e6d468/resources/generate/types.d.ts";

export * as path from "https://deno.land/std@0.198.0/path/mod.ts";
export * as assert from "https://deno.land/std@0.198.0/assert/mod.ts";
export { walkSync } from "https://deno.land/std@0.198.0/fs/walk.ts";
export { parse as parseYaml } from "https://deno.land/std@0.198.0/yaml/parse.ts";
export * from "npm:@octokit/rest";

import Ajv from "npm:ajv@8.12.0";
import schema from "../userstyles.schema.json" assert { type: "json" };
import portsSchema from "https://raw.githubusercontent.com/catppuccin/catppuccin/cad3fe6c9eb2476f9787c386a6b9c70de8e6d468/resources/ports.schema.json" assert {
  type: "json",
};

export { Ajv, portsSchema, schema };
