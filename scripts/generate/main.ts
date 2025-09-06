import * as path from "@std/path";
import { REPO_ROOT } from "@/constants.ts";

import { syncIssueLabels } from "@/generate/labels.ts";
import { generateStyleReadmes } from "@/generate/readme-styles.ts";
import { writeWithPreamble } from "@/generate/utils.ts";
import {
  getAuthenticatedOctokit,
  getUserstylesData,
  getUserstylesTeamMembers,
} from "@/utils.ts";

if (!Deno.env.get("CI")) {
  throw new Error(
    "This script should only be used in CI. Generated READMEs and other health files are automatically updated after pull requests are merged.",
  );
}

const userstylesData = getUserstylesData();

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
function maintainersCodeOwners() {
  return Object.entries(userstylesData.userstyles!)
    .filter(([_, { "current-maintainers": currentMaintainers }]) =>
      currentMaintainers.length > 0
    )
    .map(([slug, { "current-maintainers": currentMaintainers }]) => {
      const codeOwners = currentMaintainers
        .map((name) => `@${name}`)
        .join(" ");
      return `/styles/${slug} ${codeOwners}`;
    })
    .join("\n");
}
async function userstylesStaffCodeOwners() {
  const paths = ["/.github/", "/scripts/", "/template/", "/lib/"];

  const octokit = getAuthenticatedOctokit();
  // Set codeowners to include each member of the userstyles-staff team specifically instead of the team as a whole,
  // to require individual reviews from each member instead of just one on behalf of the team.
  const staffMembers = await getUserstylesTeamMembers(
    octokit,
    "userstyles-staff",
  );
  return paths.map((path) =>
    `${path} ${staffMembers.map((member) => "@" + member).join(" ")}`
  ).join(
    "\n",
  );
}
await writeWithPreamble(
  path.join(REPO_ROOT, ".github/CODEOWNERS"),
  `${maintainersCodeOwners()}\n\n${await userstylesStaffCodeOwners()}`,
);
