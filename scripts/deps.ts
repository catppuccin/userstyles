import portsSchema from "catppuccin-repo/resources/ports.schema.json" with {
  type: "json",
};
import userStylesSchema from "@/userstyles.schema.json" with {
  type: "json",
};

import { join } from "std/path/mod.ts";
const ROOT = new URL(".", import.meta.url).pathname;
/**
 * absolute path to the repository
 */
export const REPO_ROOT = join(ROOT, "..");

export { portsSchema, userStylesSchema };
