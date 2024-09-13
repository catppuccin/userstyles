import type { UserStylesSchema } from "@/types/mod.ts";
import { REPO_ROOT } from "@/constants.ts";

import * as path from "@std/path";
import * as YAML from "@std/yaml";

import { updateFileWithPreamble } from "@/generate/utils.ts";

import { type ColorName, flavors } from "@catppuccin/palette";

/**
 * Macchiato color definitions as hex values.
 */
const macchiatoHex = flavors.macchiato.colorEntries
  .reduce((acc, [identifier, { hex }]) => {
    acc[identifier] = hex;
    return acc;
  }, {} as Record<ColorName, string>);

const toIssueLabel = (slug: string | number) => `lbl:${slug}`;

export async function syncIssueLabels(
  userstyles: UserStylesSchema.Userstyles,
) {
  updateFileWithPreamble(
    path.join(REPO_ROOT, ".github/issue-labeler.yml"),
    YAML.stringify(
      Object.entries(userstyles)
        .reduce((acc, [key]) => {
          acc[key.toString()] = [`/${toIssueLabel(key)}(,.*)?$/gm`];
          return acc;
        }, {} as Record<string, string[]>),
    ),
  );

  const userstyleIssueContent = Deno.readTextFileSync(path.join(
    REPO_ROOT,
    "scripts/generate/templates/userstyle-issue.yml",
  ));
  Deno.writeTextFileSync(
    path.join(REPO_ROOT, ".github/ISSUE_TEMPLATE/userstyle.yml"),
    userstyleIssueContent.replace(
      `"$LABELS"`,
      `${
        Object.entries(userstyles)
          .map(([key]) => `"${toIssueLabel(key)}"`)
          .join(", ")
      }`,
    ),
  );

  // .github/pr-labeler.yml
  updateFileWithPreamble(
    path.join(REPO_ROOT, ".github/pr-labeler.yml"),
    YAML.stringify(
      Object.entries(userstyles)
        .reduce((acc, [key]) => {
          acc[`${key}`] = `styles/${key}/**/*`;
          return acc;
        }, {} as Record<string, string>),
    ),
  );

  // .github/labels.yml
  const syncLabelsContent = Object.entries(userstyles)
    .map(([slug, style]) => {
      return {
        name: slug,
        description: [style.name].flat().join(", "),
        color: style.color ? macchiatoHex[style.color] : macchiatoHex.blue,
      };
    });
  const syncLabels = path.join(REPO_ROOT, ".github/labels.yml");
  await updateFileWithPreamble(syncLabels, YAML.stringify(syncLabelsContent));
}
