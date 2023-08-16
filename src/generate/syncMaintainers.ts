#!/usr/bin/env -S deno run --allow-read --allow-net --allow-env
import { Ajv, parseYaml, path, schema } from "./deps.ts";
import { Userstyles } from "./types.d.ts";

const ROOT = new URL(".", import.meta.url).pathname;
type Metadata = {
  userstyles: Userstyles;
};

const ajv = new (Ajv as unknown as (typeof Ajv)["default"])();
const validate = ajv.compile<Metadata>(schema);

const userstylesYaml = Deno.readTextFileSync(
  path.join(ROOT, "../userstyles.yml"),
);
const userstylesData = parseYaml(userstylesYaml);
if (!validate(userstylesData)) {
  console.error(validate.errors);
  Deno.exit(1);
}

const maintainers = [...new Set(Object.values(userstylesData.userstyles).flatMap((style) =>
  style.readme["current-maintainers"].map((m) => m.url.split("/").pop())
))];

const requestGH = async (endpoint, method = "GET", returnJson = true, body?) => {
  const res = await fetch("https://api.github.com/orgs/catppuccin/teams/userstyles-maintainers" + endpoint, {
    method,
    headers: {
      "Authorization": `Bearer ${Deno.args[0]}`
    },
    body,
  })
  return returnJson ? res.json() : res
}

const teamMembersQuery = await requestGH("/members");
const teamMembers = teamMembersQuery.map(l => l.login);

// check if two arrays are equal, disregarding the order
const checkEquality = (a, b) => a.length === b.length && a.every(e => b.includes(e));
const getExtra = (a, b) => a.filter(e => !b.includes(e))

if (!checkEquality(maintainers, teamMembers)) {
  if (maintainers.length > teamMembers.length) {
    for (const m of getExtra(maintainers, teamMembers)) {
      requestGH(`/memberships/${m}`, 'PUT', false, JSON.stringify({ role: "member" }))
      console.log(`Added ${m} to the team`)
    }
  } else {
    for (const m of getExtra(teamMembers, maintainers)) {
      requestGH(`/memberships/${m}`, 'DELETE', false)
      console.log(`Removed ${m} from the team`)
    }
  }
} else {
  console.log("Maintainers are in sync")
}
