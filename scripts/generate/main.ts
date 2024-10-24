import * as path from "@std/path";
import { REPO_ROOT } from "@/constants.ts";

import { syncIssueLabels } from "@/generate/labels.ts";
import { generateMainReadme } from "@/generate/readme-repo.ts";
import { generateStyleReadmes } from "@/generate/readme-styles.ts";
import { writeWithPreamble } from "@/generate/utils.ts";
import { getPortsData, getUserstylesData } from "@/utils.ts";

const userstylesData = getUserstylesData();
const portsData = await getPortsData();

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
      return `/styles/${slug} ${codeOwners}`;
    })
    .join("\n");
};
const userstylesStaffCodeOwners = () => {
  const paths = ["/.github/", "/scripts/", "/template/"];
  return paths.map((path) => `${path} @catppuccin/userstyles-staff`).join(
    "\n",
  );
};
await writeWithPreamble(
  path.join(REPO_ROOT, ".github/CODEOWNERS"),
  `${maintainersCodeOwners()}\n\n${userstylesStaffCodeOwners()}`,
);
