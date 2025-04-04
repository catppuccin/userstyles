import type { UserstylesSchema } from "@/types/mod.ts";
import { REPO_ROOT } from "@/constants.ts";

import * as path from "@std/path";
import * as yaml from "@std/yaml";

import { type ColorName, flavors } from "@catppuccin/palette";
import { writeWithPreamble } from "@/generate/utils.ts";

/**
 * Macchiato color definitions as hex values.
 */
const macchiatoHex = flavors.macchiato.colorEntries
  .reduce((acc, [identifier, { hex }]) => {
    acc[identifier] = hex;
    return acc;
  }, {} as Record<ColorName, string>);

const toIssueLabel = (slug: string | number) => `lbl:${slug}`;

export async function syncIssueLabels(userstyles: UserstylesSchema.Userstyles) {
  // .github/issue-labeler.yml
  await writeWithPreamble(
    path.join(REPO_ROOT, ".github/issue-labeler.yml"),
    yaml.stringify(
      Object.entries(userstyles)
        .reduce((acc, [key]) => {
          acc[key.toString()] = [`/${toIssueLabel(key)}(,.*)?$/gm`];
          return acc;
        }, {} as Record<string, string[]>),
    ),
  );

  // .github/ISSUE_TEMPLATE/userstyle.yml
  const userstyleIssueTemplate = Deno.readTextFileSync(path.join(
    REPO_ROOT,
    "scripts/generate/templates/userstyle-issue.yml",
  ));
  await Deno.writeTextFile(
    path.join(REPO_ROOT, ".github/ISSUE_TEMPLATE/userstyle.yml"),
    userstyleIssueTemplate.replace(
      `"$LABELS"`,
      `${
        Object.entries(userstyles)
          .map(([key]) => `"${toIssueLabel(key)}"`)
          .join(", ")
      }`,
    ),
  );

  // .github/pr-labeler.yml
  await writeWithPreamble(
    path.join(REPO_ROOT, ".github/pr-labeler.yml"),
    yaml.stringify(
      Object.entries(userstyles)
        .filter(([_, {alias}]) => !alias)
        .reduce((acc, [key]) => {
          acc[`${key}`] = `styles/${key}/**/*`;
          return acc;
        }, {} as Record<string, string>),
    ),
  );

  // .github/labels.yml
  await writeWithPreamble(
    path.join(REPO_ROOT, ".github/labels.yml"),
    yaml.stringify(
      Object.entries(userstyles)
        .map(([slug, style]) => {
          return {
            name: slug,
            description: [style.name].flat().join(", "),
            color: style.color ? macchiatoHex[style.color] : macchiatoHex.blue,
          };
        }),
    ),
  );
}
