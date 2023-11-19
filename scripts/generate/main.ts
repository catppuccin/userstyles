#!/usr/bin/env -S deno run -A
import { join } from "std/path/mod.ts";

import { portsSchema, REPO_ROOT, schema } from "@/deps.ts";
import { PortsSchema, UserStylesSchema } from "@/types/mod.d.ts";
import { syncIssueLabels } from "./labels.ts";
import { updateFile, validateYaml } from "./utils.ts";
import { generateMainReadme } from "./readme-repo.ts";
import { generateStyleReadmes } from "./readme-styles.ts";

const userstylesYaml = Deno.readTextFileSync(
  join(REPO_ROOT, "scripts/userstyles.yml"),
);
const portsYaml = await fetch(
  "https://raw.githubusercontent.com/catppuccin/catppuccin/main/resources/ports.yml",
).then((res) => res.text());

const [portsData, userstylesData] = await Promise.all([
  await validateYaml<PortsSchema.PortsSchema>(portsYaml, portsSchema),
  await validateYaml<UserStylesSchema.UserstylesSchema>(userstylesYaml, schema),
]).catch((e) => {
  console.error(e);
  Deno.exit(1);
});

if (!userstylesData.userstyles) {
  console.error("No userstyles found");
  Deno.exit(1);
}

/**
 * Generate the main README.md, listing all ports as a table of contents
 */
await generateMainReadme(userstylesData.userstyles, portsData);
/**
 * Generate README.md files for each style
 */
generateStyleReadmes(userstylesData.userstyles);
/**
 * Keep
 * - `.github/issue-labeler.yml`
 * - `.github/labels.yml`
 * - `.github/pr-labeler.yml`
 * in sync with the userstyle metadata.
 */
syncIssueLabels(userstylesData.userstyles);

/**
 * Keep `.github/CODEOWNERS` in sync with the userstyle metadata.
 */
await updateFile(
  join(REPO_ROOT, ".github/CODEOWNERS"),
  Object.entries(userstylesData.userstyles)
    .map(([slug, { readme }]) => {
      const currentMaintainers = readme["current-maintainers"]
        .map((maintainer) => `@${maintainer.url.split("/").pop()}`)
        .join(" ");
      return `/styles/${slug} ${currentMaintainers}`;
    })
    .join("\n"),
);
