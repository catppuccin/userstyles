import schema from "./userstyles.schema.json" assert { type: "json" };
import portsSchema from "catppuccin-repo/resources/ports.schema.json" assert {
  type: "json",
};

import { join } from "std/path/mod.ts";
const ROOT = new URL(".", import.meta.url).pathname;
/** absolute path to the repository */
export const REPO_ROOT = join(ROOT, "..");

export { portsSchema, schema };
