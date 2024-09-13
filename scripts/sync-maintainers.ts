import type { UserStylesSchema } from "@/types/mod.ts";

import * as assert from "@std/assert";
import { Octokit } from "@octokit/rest";

import { getUserstylesData } from "@/utils/yaml.ts";

const octokit = new Octokit({ auth: Deno.env.get("GITHUB_TOKEN") });
const team = { org: "catppuccin", team_slug: "userstyles-maintainers" };

const { userstyles } = getUserstylesData();

// Lowercase usernames of all the "current-maintainers" in the file.
const maintainers = [
  ...new Set(
    Object.values(userstyles).flatMap((
      style: UserStylesSchema.Userstyle,
    ) =>
      style["current-maintainers"].map((maintainer) => {
        const username = maintainer.url.split("github.com/")?.pop();
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
  .then(({ data }) => data.map((member) => member.login.toLowerCase()));

if (!assert.equal(maintainers, teamMembers)) {
  const maintainersToAdd = maintainers.filter((m) => !teamMembers.includes(m));
  const membersToRemove = teamMembers.filter((m) => !maintainers.includes(m));

  for (const maintainers of maintainersToAdd) {
    await octokit.teams.addOrUpdateMembershipForUserInOrg({
      ...team,
      username: maintainers,
    });
    console.log(
      `Added ${maintainers} to the ${team.org}/${team.team_slug} team.`,
    );
  }
  console.log(
    `${maintainersToAdd.length} users added to the ${team.org}/${team.team_slug} team.`,
  );

  for (const member of membersToRemove) {
    await octokit.teams.removeMembershipForUserInOrg({
      ...team,
      username: member,
    });
    console.log(
      `Removed ${member} from the ${team.org}/${team.team_slug} team.`,
    );
  }
  console.log(
    `${membersToRemove.length} users removed from the ${team.org}/${team.team_slug} team.`,
  );
} else {
  console.log("Maintainers and team members are in sync");
}
