import { join } from "std/path/mod.ts";

import { REPO_ROOT } from "@/deps.ts";
import { updateFile } from "@/generate/utils.ts";
import { UserStylesSchema } from "@/types/mod.ts";
import { stringify } from "std/yaml/stringify.ts";
import palette from "https://raw.githubusercontent.com/catppuccin/palette/v0.2.0/palette-porcelain.json" with {
  type: "json",
};

/**
 * Macchiato color definitions as hex values.
 */
const macchiatoHex = Object.entries(palette.macchiato)
  .reduce((acc, [k, v]) => {
    acc[k] = `#${v.hex}`;
    return acc;
  }, {} as Record<keyof typeof palette.macchiato, string>);

const toIssueLabel = (slug: string | number) => `lbl:${slug}`;

export const syncIssueLabels = async (
  userstyles: UserStylesSchema.Userstyles,
) => {
  updateFile(
    join(REPO_ROOT, ".github/issue-labeler.yml"),
    stringify(
      Object.entries(userstyles)
        .reduce((acc, [key]) => {
          acc[key.toString()] = [`^${toIssueLabel(key)}$`];
          return acc;
        }, {} as Record<string, string[]>),
    ),
  );

  const userstyleIssueContent = Deno.readTextFileSync(join(
    REPO_ROOT,
    "scripts/generate/templates/userstyle-issue.yml",
  ));
  Deno.writeTextFileSync(
    join(REPO_ROOT, ".github/ISSUE_TEMPLATE/userstyle.yml"),
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
    join(REPO_ROOT, ".github/pr-labeler.yml"),
    stringify(
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
  const syncLabels = join(REPO_ROOT, ".github/labels.yml");
  // deno-lint-ignore no-explicit-any
  await updateFile(syncLabels, stringify(syncLabelsContent as any));
};
