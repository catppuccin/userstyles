#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env
import { Ajv, assert, Octokit, parseYaml, path, schema } from "./deps.ts";
import { UserstylesSchema } from "./types.d.ts";

const octokit = new Octokit({ auth: Deno.env.get("GITHUB_TOKEN") });
const team = { org: "catppuccin", team_slug: "userstyles-maintainers" };

const ROOT = new URL(".", import.meta.url).pathname;

const ajv = new Ajv.default();
const validate = ajv.compile<UserstylesSchema>(schema);

const userstylesYaml = Deno.readTextFileSync(
  path.join(ROOT, "../userstyles.yml"),
);
const userstylesData = parseYaml(userstylesYaml);
if (!validate(userstylesData)) {
  console.error(validate.errors);
  Deno.exit(1);
}

// lowercase usernames of all maintainers in the file
const maintainers = userstylesData.collaborators?.map((c) => {
  const username = c.url.split("github.com/")?.pop();
  // check that they follow github.com/username pattern
  assert.assertExists(username);
  return username.toLowerCase();
});

// lowercase usernames of all maintainers in the current GH team
const teamMembers = await octokit.teams.listMembersInOrg({
  ...team,
  per_page: 100,
}).then((res) => res.data.map((m) => m.login.toLowerCase()));

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
