import portsSchema from "catppuccin-repo/resources/ports.schema.json" with {
  type: "json",
};
import userStylesSchema from "@/userstyles.schema.json" with {
  type: "json",
};

import { join } from "std/path/mod.ts";

const ROOT = import.meta.dirname;
if (!ROOT) {
  throw new Error("ROOT was not located.");
}

/**
 * absolute path to the repository
 */
export const REPO_ROOT = join(ROOT, "..");

export { portsSchema, userStylesSchema };
