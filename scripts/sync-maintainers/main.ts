import type { Userstyle } from "@/types/userstyles.d.ts";

import * as assert from "@std/assert";

import { Octokit } from "@octokit/rest";
import { getUserstylesData } from "@/utils.ts";

const octokit = new Octokit({ auth: Deno.env.get("GITHUB_TOKEN") });
const team = { org: "catppuccin", team_slug: "userstyles-maintainers" };

const { userstyles } = getUserstylesData();

// Lowercase usernames of all the "current-maintainers" in the file.
const maintainers = [
  ...new Set(
    Object.values(userstyles).flatMap((
      style: Userstyle,
    ) =>
      style["current-maintainers"].map((m) => {
        const username = m.url.split("github.com/")?.pop();
        // Check that they follow github.com/username pattern.
        assert.assertExists(username);
        return username.toLowerCase();
      })
    ),
  ),
];

// Lowercase usernames of all maintainers in the current GitHub team.
const teamMembers = await octokit.teams
  .listMembersInOrg({
    ...team,
    per_page: 100,
  })
  .then((res) => res.data.map((m) => m.login.toLowerCase()));

async function syncMaintainers() {
  if (!maintainers) return;
  if (assert.equal(maintainers, teamMembers)) {
    console.log("Maintainers are in sync");
    return;
  }

  const toAdd = maintainers.filter((m) => !teamMembers.includes(m));
  const toRemove = teamMembers.filter((m) => !maintainers.includes(m));

  for (const m of toAdd) {
    await octokit.teams.addOrUpdateMembershipForUserInOrg({
      ...team,
      username: m,
    });
    console.log(`Added ${m} to the ${team.org}/${team.team_slug} team.`);
  }
  console.log(
    `${toAdd.length} users added to the ${team.org}/${team.team_slug} team.`,
  );

  for (const m of toRemove) {
    await octokit.teams.removeMembershipForUserInOrg({
      ...team,
      username: m,
    });
    console.log(
      `Removed ${m} from the ${team.org}/${team.team_slug} team.`,
    );
  }
  console.log(
    `${toRemove.length} users removed from the ${team.org}/${team.team_slug} team.`,
  );
}

await syncMaintainers();
