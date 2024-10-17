import * as path from "@std/path";

import { REPO_ROOT } from "../constants.ts";
import { updateFile } from "@/generate/utils.ts";
import { UserStylesSchema } from "@/types/mod.ts";
import * as yaml from "@std/yaml";
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

export async function syncIssueLabels(userstyles: UserStylesSchema.Userstyles) {
  updateFile(
    path.join(REPO_ROOT, ".github/issue-labeler.yml"),
    yaml.stringify(
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
  updateFile(
    path.join(REPO_ROOT, ".github/pr-labeler.yml"),
    yaml.stringify(
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
  // deno-lint-ignore no-explicit-any
  await updateFile(syncLabels, yaml.stringify(syncLabelsContent as any));
}
