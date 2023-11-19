import portsSchema from "catppuccin-repo/resources/ports.schema.json" assert {
  type: "json",
};
import userStylesSchema from "@/userstyles.schema.json" assert {
  type: "json",
};

/**
 * external schemas for GitHub workflows
 */
import gitHubIssueFormsSchema from "https://raw.githubusercontent.com/SchemaStore/schemastore/404ada34125022391ae5a4484d490f3d769a6555/src/schemas/json/github-issue-forms.json" assert {
  type: "json",
};

import { join } from "std/path/mod.ts";
const ROOT = new URL(".", import.meta.url).pathname;
/**
 * absolute path to the repository
 */
export const REPO_ROOT = join(ROOT, "..");

export { gitHubIssueFormsSchema, portsSchema, userStylesSchema };
