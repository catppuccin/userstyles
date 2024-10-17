import portsSchema from "catppuccin-repo/resources/ports.schema.json" with {
  type: "json",
};
import userStylesSchema from "@/userstyles.schema.json" with {
  type: "json",
};

import * as path from "@std/path";

const ROOT = import.meta.dirname;
if (!ROOT) {
  throw new Error("ROOT was not located.");
}

/**
 * absolute path to the repository
 */
export const REPO_ROOT = path.join(ROOT, "..");

export { portsSchema, userStylesSchema };
