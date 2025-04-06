import type { CategoriesSchema, UserstylesSchema } from "@/types/mod.ts";
import { REPO_ROOT } from "@/constants.ts";

import * as path from "@std/path";
import Handlebars from "handlebars";

import { updateReadme } from "@/generate/utils.ts";

type MappedPorts = {
  [k: string]: (
    UserstylesSchema.Userstyle & { rawGitHubLink: string }
  )[];
};

export async function generateMainReadme(
  userstyles: UserstylesSchema.Userstyles,
  categoriesData: CategoriesSchema.CategoryDefinitions,
) {
  if (!categoriesData) throw ("Categories data is missing categories");

  const userstylesWithNotes = Object.values(userstyles).filter(({ note }) => note);

  const categorized = Object.entries(userstyles)
    .reduce((acc, [slug, { categories, supports, ...port }]) => {
      // initialize category array if it doesn't exist
      // only care about the first (primary) category in the categories array
      acc[categories[0]] ??= [];

      const userstyle = {
        rawGitHubLink:
          `https://raw.githubusercontent.com/catppuccin/userstyles/main/styles/${slug}/catppuccin.user.less`,
        categories,
        ...port,
      };

      acc[categories[0]].push(userstyle);

      Object.values(supports ?? {}).forEach(({ name, link }) => {
        acc[categories[0]].push({
          ...userstyle,
          name,
          link,
        });
      });

      // Sort by name
      acc[categories[0]].sort((a, b) => a.name.localeCompare(b.name));
      return acc;
    }, {} as MappedPorts);

  const portListData = categoriesData
    .filter((category) => categorized[category.key] !== undefined)
    .map((category) => {
      return { meta: category, ports: categorized[category.key] };
    });

  const portContent = Handlebars.compile(`{{#each category}}
<details open>
<summary>{{emoji}} {{name}}</summary>

{{#each ports}}
- {{#unless maintained}}❤️‍🩹 {{/unless}}[{{ name }}]({{ rawGitHubLink }}){{#if note}}[^{{ noteIndex }}]{{/if}}
{{/each}}

</details>
{{/each}}

{{#each userstylesWithNotes}}

[^{{ @index }}]: {{ note }}

{{/each}}
`)({
    category: portListData.map(({ meta, ports }) => {
      return {
        emoji: meta.emoji,
        name: meta.name,
        ports: ports.map(
          (
            {
              name,
              rawGitHubLink,
              note,
              "current-maintainers": currentMaintainers,
            },
          ) => {
            return {
              name,
              maintained: currentMaintainers.length > 0,
              rawGitHubLink,
              note,
              noteIndex: userstylesWithNotes.findIndex((style) => name === style.name),
            };
          },
        ),
      };
    }),
    userstylesWithNotes,
  });

  const readmePath = path.join(REPO_ROOT, "README.md");
  await Deno.writeTextFile(
    readmePath,
    updateReadme({
      readme: Deno.readTextFileSync(readmePath),
      section: "userstyles",
      newContent: portContent,
    }),
  ).catch((e) => console.error(e));
}
