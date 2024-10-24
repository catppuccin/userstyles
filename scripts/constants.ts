import PORTS_SCHEMA from "@catppuccin/catppuccin/resources/ports.schema.json" with {
  type: "json",
};
import USERSTYLES_SCHEMA from "@/userstyles.schema.json" with {
  type: "json",
};

import * as path from "@std/path";

const ROOT = import.meta.dirname;
if (!ROOT) throw new Error("ROOT was not located.");

/**
 * Absolute path to the repository.
 */
export const REPO_ROOT = path.join(ROOT, "..");

export { PORTS_SCHEMA, USERSTYLES_SCHEMA };
