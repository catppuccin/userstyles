import { Octokit } from "@octokit/rest";

export function getAuthenticatedOctokit() {
  return new Octokit({ auth: process.env["GITHUB_TOKEN"] });
}

export type UserstylesTeam = "userstyles-staff" | "userstyles-maintainers";

export async function getUserstylesTeamMembers(
  octokit: Octokit,
  team: UserstylesTeam,
): Promise<string[]> {
  const members = await octokit.teams.listMembersInOrg({
    org: "catppuccin",
    team_slug: team,
    per_page: 100,
  });
  return members.data.map(({ login }) => login.toLowerCase());
}

export async function addUserstylesTeamMember(
  octokit: Octokit,
  team: UserstylesTeam,
  username: string,
) {
  await octokit.teams.addOrUpdateMembershipForUserInOrg({
    org: "catppuccin",
    team_slug: team,
    username,
  });
}

export async function removeUserstylesTeamMember(
  octokit: Octokit,
  team: UserstylesTeam,
  username: string,
) {
  await octokit.teams.removeMembershipForUserInOrg({
    org: "catppuccin",
    team_slug: team,
    username,
  });
}
