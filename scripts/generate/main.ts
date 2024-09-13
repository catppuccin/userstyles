import type { PortsSchema, UserStylesSchema } from "@/types/mod.ts";
import { PORTS_SCHEMA, REPO_ROOT, USERSTYLES_SCHEMA } from "@/constants.ts";

import * as path from "@std/path";

import { syncIssueLabels } from "@/generate/labels.ts";
import { generateMainReadme } from "@/generate/readme-repo.ts";
import { generateStyleReadmes } from "@/generate/readme-styles.ts";
import { updateFileWithPreamble } from "@/generate/utils.ts";
import { validateYaml } from "@/utils/yaml.ts";

const userstylesYaml = Deno.readTextFileSync(
  path.join(REPO_ROOT, "scripts/userstyles.yml"),
);

const portsYaml = await fetch(
  "https://raw.githubusercontent.com/catppuccin/catppuccin/main/resources/ports.yml",
).then((res) => res.text());

const [portsData, userstylesData] = await Promise.all([
  await validateYaml<PortsSchema.PortsSchema>(
    portsYaml,
    PORTS_SCHEMA,
  ),
  await validateYaml<UserStylesSchema.UserstylesSchema>(
    userstylesYaml,
    USERSTYLES_SCHEMA,
  ),
]);

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
await syncIssueLabels(userstylesData.userstyles);

const STAFF_TEAM = "@catppuccin/userstyles-staff";

/**
 * Keep `.github/CODEOWNERS` in sync with the userstyle metadata.
 */
const maintainersCodeOwners = () => {
  return Object.entries(userstylesData.userstyles!)
    .filter(([_, { "current-maintainers": currentMaintainers }]) =>
      currentMaintainers.length > 0
    )
    .map(([slug, { "current-maintainers": currentMaintainers }]) => {
      const codeOwners = currentMaintainers
        .map((maintainer) => `@${maintainer.url.split("/").pop()}`)
        .join(" ");
      return `styles/${slug} ${codeOwners} !${STAFF_TEAM}`;
    })
    .join("\n");
};
const userstylesStaffCodeOwners = () => {
  const paths = [".github/", "scripts/", "template/", "*"];
  return paths.map((path) => `${path} ${STAFF_TEAM}`).join(
    "\n",
  );
};
await updateFileWithPreamble(
  path.join(REPO_ROOT, ".github/CODEOWNERS"),
  `${maintainersCodeOwners()}\n\n${userstylesStaffCodeOwners()}`,
);
