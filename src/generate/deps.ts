export { parse as parseYaml } from "https://deno.land/std@0.172.0/encoding/yaml.ts";

import Ajv from "npm:ajv@8.12.0";
import * as path from "https://deno.land/std@0.172.0/path/mod.ts";
import schema from "https://raw.githubusercontent.com/catppuccin/catppuccin/main/resources/ports.schema.json" assert { type: "json" };

export { Ajv, path, schema };
