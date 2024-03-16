#!/usr/bin/env -S deno run -A
import * as assert from "std/assert/mod.ts";
import { Octokit } from "@octokit/rest";

import type { UserStylesSchema } from "@/types/mod.ts";
import { getUserstylesData } from "@/utils.ts";

const octokit = new Octokit({ auth: Deno.env.get("GITHUB_TOKEN") });
const team = { org: "catppuccin", team_slug: "userstyles-maintainers" };

const { userstyles } = getUserstylesData();

// Lowercase usernames of all the "current-maintainers" in the file.
const maintainers = [
  ...new Set(
    Object.values(userstyles).flatMap((
      style: UserStylesSchema.Userstyle,
    ) =>
      style.readme["current-maintainers"].map((m) => {
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

const syncMaintainers = async () => {
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
    console.log(`Removed ${m} from the ${team.org}/${team.team_slug} team.`);
  }
  console.log(
    `${toRemove.length} users removed from the ${team.org}/${team.team_slug} team.`,
  );
};

await syncMaintainers();
