export { parse as parseYaml } from "https://deno.land/std@0.172.0/encoding/yaml.ts";

import Ajv from "https://esm.sh/ajv@8.12.0";
import * as path from "https://deno.land/std@0.172.0/path/mod.ts";
import schema from "../userstyles.schema.json" assert { type: "json" };
import portsSchema from "https://raw.githubusercontent.com/catppuccin/catppuccin/main/resources/ports.schema.json" assert { type: "json" };

export type { Categories as PortCategories } from "https://raw.githubusercontent.com/catppuccin/catppuccin/main/resources/generate/types.d.ts";
export { Ajv, path, portsSchema, schema };
