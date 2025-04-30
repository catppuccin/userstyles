import type { Userstyle } from "@/types/userstyles.d.ts";

import * as assert from "@std/assert";

import {
  addUserstylesTeamMember,
  getAuthenticatedOctokit,
  getUserstylesData,
  getUserstylesTeamMembers,
  removeUserstylesTeamMember,
} from "@/utils.ts";

const { userstyles } = getUserstylesData();

// Lowercase usernames of all the "current-maintainers" in the file.
const maintainers = [
  ...new Set(
    Object.values(userstyles).flatMap((
      style: Userstyle,
    ) =>
      style["current-maintainers"].map((name) => {
        assert.assertExists(name);
        return name.toLowerCase();
      })
    ),
  ),
];

assert.assertExists(maintainers);
assert.assert(Array.isArray(maintainers));
assert.assertGreater(maintainers.length, 0);

const octokit = getAuthenticatedOctokit();
const team = "userstyles-maintainers";
const maintainersTeamMembers = await getUserstylesTeamMembers(
  octokit,
  team,
);

if (assert.equal(maintainers, maintainersTeamMembers)) {
  console.log("Maintainers are in sync.");
  Deno.exit(0);
}

const toAdd = maintainers.filter((m) => !maintainersTeamMembers.includes(m));
const toRemove = maintainersTeamMembers.filter((m) => !maintainers.includes(m));

for (const maintainer of toAdd) {
  await addUserstylesTeamMember(octokit, team, maintainer);
  console.log(
    `Added ${maintainer} to the catppuccin/${team} team.`,
  );
}
console.log(
  `${toAdd.length} users added to the catppuccin/${team} team.`,
);

for (const member of toRemove) {
  await removeUserstylesTeamMember(octokit, team, member);
  console.log(
    `Removed ${member} from the catppuccin/${team} team.`,
  );
}
console.log(
  `${toRemove.length} users removed from the catppuccin/${team} team.`,
);
