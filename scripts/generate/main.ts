#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net

import { join } from "std/path/mod.ts";
import Handlebars from "handlebars";

import { portsSchema, REPO_ROOT, schema } from "@/deps.ts";
import { PortsSchema, UserStylesSchema } from "@/types/mod.d.ts";
import { syncIssueLabels } from "./labels.ts";
import { updateFile, updateReadme, validateYaml } from "./utils.ts";
import { generateStyleReadmes } from "./readme-styles.ts";

type Metadata = {
  userstyles: UserStylesSchema.Userstyles;
};
type PortMetadata = { categories: PortsSchema.Categories };

export type MappedPort = UserStylesSchema.Userstyle & { path: string };

const userstylesYaml = Deno.readTextFileSync(
  join(REPO_ROOT, "scripts/userstyles.yml"),
);
const portsYaml = await fetch(
  "https://raw.githubusercontent.com/catppuccin/catppuccin/main/resources/ports.yml",
).then((res) => res.text());

const [portsData, userstylesData] = await Promise.all([
  await validateYaml<PortMetadata>(portsYaml, portsSchema),
  await validateYaml<Metadata>(userstylesYaml, schema),
]).catch((e) => {
  console.error(e);
  Deno.exit(1);
});

if (!userstylesData.userstyles) {
  console.error("No userstyles found");
  Deno.exit(1);
}

const categorized = Object.entries(userstylesData.userstyles)
  .reduce((acc, [slug, { category, ...port }]) => {
    // initialize category array if it doesn't exist
    acc[category] ??= [];

    acc[category].push({ path: `styles/${slug}`, category, ...port });

    // Sort by name, first array entry if necessary
    acc[category].sort((a, b) =>
      [a.name].flat()[0].localeCompare([b.name].flat()[0])
    );
    return acc;
  }, {} as Record<string, MappedPort[]>);

const portListData = portsData.categories
  .filter((category) => categorized[category.key] !== undefined)
  .map((category) => {
    return { meta: category, ports: categorized[category.key] };
  });

const portContent = Handlebars.compile(`{{#each category}}
<details open>
<summary>{{emoji}} {{name}}</summary>

{{#each ports}}
- [{{#each name}}{{ this }}{{#unless @last}}, {{/unless}}{{/each}}]({{ path }})
{{/each}}

</details>
{{/each}}`)({
  category: portListData.map(({ meta, ports }) => {
    return {
      emoji: meta.emoji,
      name: meta.name,
      ports: ports.map(({ name, path }) => {
        return {
          name: [name].flat(),
          path,
        };
      }),
    };
  }),
});

const readmePath = join(REPO_ROOT, "README.md");
await updateFile(
  readmePath,
  updateReadme({
    readme: Deno.readTextFileSync(readmePath),
    section: "userstyles",
    newContent: portContent,
  }),
  false,
).catch((e) => console.error(e));

syncIssueLabels(userstylesData.userstyles);
generateStyleReadmes(userstylesData.userstyles);

const ownersPath = join(REPO_ROOT, ".github/CODEOWNERS");
const ownersContent = Object.entries(userstylesData.userstyles)
  .map(([key, style]) => {
    const currentMaintainers = style.readme["current-maintainers"]
      .map((maintainer) => `@${maintainer.url.split("/").pop()}`)
      .join(" ");
    return `/styles/${key} ${currentMaintainers}`;
  })
  .join("\n");
updateFile(ownersPath, ownersContent);
