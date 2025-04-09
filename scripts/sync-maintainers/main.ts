import type { Userstyle } from "../types/userstyles.d.ts";

import assert from "node:assert/strict";

import {
  getUserstylesData,
} from "../utils/data.ts";
import { isDeepStrictEqual } from "node:util";
import { getAuthenticatedOctokit, getUserstylesTeamMembers, addUserstylesTeamMember, removeUserstylesTeamMember } from "../utils/octokit.ts";

const { userstyles } = getUserstylesData();

// Lowercase usernames of all the "current-maintainers" in the file.
const maintainers = [
  ...new Set(
    Object.values(userstyles).flatMap((
      style: Userstyle,
    ) =>
      style["current-maintainers"].map((name) => name.toLowerCase())
    ),
  ),
];

assert(Array.isArray(maintainers));
assert(maintainers.length > 0);

const octokit = getAuthenticatedOctokit();
const team = "userstyles-maintainers";
const maintainersTeamMembers = await getUserstylesTeamMembers(
  octokit,
  team,
);

if (isDeepStrictEqual(maintainers.toSorted(), maintainersTeamMembers.toSorted())) {
  console.log("Maintainers are in sync.");
  process.exit(0);
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
