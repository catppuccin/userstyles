import * as path from "@std/path";
import Handlebars from "handlebars";

import { REPO_ROOT } from "../constants.ts";
import { PortsSchema, UserStylesSchema } from "@/types/mod.ts";
import { updateFile, updateReadme } from "@/generate/utils.ts";

type MappedPorts = {
  [k: string]: (
    UserStylesSchema.Userstyle & { path: string }
  )[];
};

export async function generateMainReadme(
  userstyles: UserStylesSchema.Userstyles,
  portsData: PortsSchema.PortsSchema,
) {
  if (!portsData.categories) throw ("Ports data is missing categories");

  const categorized = Object.entries(userstyles)
    .reduce((acc, [slug, { categories, ...port }]) => {
      // initialize category array if it doesn't exist
      // only care about the first (primary) category in the categories array
      acc[categories[0]] ??= [];

      acc[categories[0]].push({ path: `styles/${slug}`, categories, ...port });

      // Sort by name, first array entry if necessary
      acc[categories[0]].sort((a, b) =>
        [a.name].flat()[0].localeCompare([b.name].flat()[0])
      );
      return acc;
    }, {} as MappedPorts);

  const portListData = portsData.categories
    .filter((category) => categorized[category.key] !== undefined)
    .map((category) => {
      return { meta: category, ports: categorized[category.key] };
    });

  const portContent = Handlebars.compile(`{{#each category}}
<details open>
<summary>{{emoji}} {{name}}</summary>

{{#each ports}}
- {{#unless maintained}}🚧 {{/unless}}[{{#each name}}{{ this }}{{#unless @last}}, {{/unless}}{{/each}}]({{ path }})
{{/each}}

</details>
{{/each}}`)({
    category: portListData.map(({ meta, ports }) => {
      return {
        emoji: meta.emoji,
        name: meta.name,
        ports: ports.map(
          ({ name, path, "current-maintainers": currentMaintainers }) => {
            return {
              name: [name].flat(),
              maintained: currentMaintainers.length > 0,
              path,
            };
          },
        ),
      };
    }),
  });

  const readmePath = path.join(REPO_ROOT, "README.md");
  await updateFile(
    readmePath,
    updateReadme({
      readme: Deno.readTextFileSync(readmePath),
      section: "userstyles",
      newContent: portContent,
    }),
    false,
  ).catch((e) => console.error(e));
}
