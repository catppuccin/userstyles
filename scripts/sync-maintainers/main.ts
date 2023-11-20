#!/usr/bin/env -S deno run -A

import * as assert from "std/assert/mod.ts";
import * as path from "std/path/mod.ts";
import { Octokit } from "@octokit/rest";

import { REPO_ROOT, userStylesSchema } from "@/deps.ts";
import type { UserStylesSchema } from "../types/mod.d.ts";
import { validateYaml } from "@/utils.ts";
import { UserstylesSchema } from "@/types/userstyles.d.ts";

const octokit = new Octokit({ auth: Deno.env.get("GITHUB_TOKEN") });
const team = { org: "catppuccin", team_slug: "userstyles-maintainers" };

const userstylesData = await validateYaml<UserstylesSchema>(
  Deno.readTextFileSync(path.join(REPO_ROOT, "scripts/userstyles.yml")),
  userStylesSchema,
);
if (userstylesData.userstyles === undefined) {
  Deno.exit(1);
}

// lowercase usernames of all the "current-maintainers" in the file
const maintainers = [
  ...new Set(
    Object.values(userstylesData.userstyles).flatMap((
      style: UserStylesSchema.Userstyle,
    ) =>
      style.readme["current-maintainers"].map((m) => {
        const username = m.url.split("github.com/")?.pop();
        // check that they follow github.com/username pattern
        assert.assertExists(username);
        return username.toLowerCase();
      })
    ),
  ),
];

// lowercase usernames of all maintainers in the current GH team
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
  }

  for (const m of toRemove) {
    await octokit.teams.removeMembershipForUserInOrg({
      ...team,
      username: m,
    });
  }
};

await syncMaintainers();
