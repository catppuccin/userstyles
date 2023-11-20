import { join } from "std/path/mod.ts";
import Handlebars from "handlebars";

import { REPO_ROOT } from "@/deps.ts";
import { PortsSchema, UserStylesSchema } from "@/types/mod.d.ts";
import { updateFile, updateReadme } from "@/generate/utils.ts";

type MappedPorts = {
  [k: string]: (
    UserStylesSchema.Userstyle & { path: string }
  )[];
};

export const generateMainReadme = async (
  userstyles: UserStylesSchema.Userstyles,
  portsData: PortsSchema.PortsSchema,
) => {
  if (!portsData.categories) throw ("Ports data is missing categories");

  const categorized = Object.entries(userstyles)
    .reduce((acc, [slug, { category, ...port }]) => {
      // initialize category array if it doesn't exist
      acc[category] ??= [];

      acc[category].push({ path: `styles/${slug}`, category, ...port });

      // Sort by name, first array entry if necessary
      acc[category].sort((a, b) =>
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
};
