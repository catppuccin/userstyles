import CATEGORIES_SCHEMA from "@catppuccin/catppuccin/resources/categories.schema.json" with {
  type: "json",
};
import USERSTYLES_SCHEMA from "./userstyles.schema.json" with {
  type: "json",
};

import path from "node:path";

const ROOT = import.meta.dirname;
if (!ROOT) throw new Error("ROOT was not located.");

/**
 * Absolute path to the repository.
 */
export const REPO_ROOT = path.join(ROOT, "..");
export const STYLES_ROOT = path.join(REPO_ROOT, "styles");

export { CATEGORIES_SCHEMA, USERSTYLES_SCHEMA };
