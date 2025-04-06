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

const toIssueLabel = (key: string) => `lbl:${key}`;

const toIssueLabelRegex = (key: string) => `/${toIssueLabel(key)}(,.*)?$/gm`;

const toPrLabel = (key: string) => `styles/${key}/**/*`;

export async function syncIssueLabels(userstyles: UserstylesSchema.Userstyles) {
  // .github/issue-labeler.yml
  await writeWithPreamble(
    path.join(REPO_ROOT, ".github/issue-labeler.yml"),
    yaml.stringify(
      Object.entries(userstyles)
        .reduce((acc, [key, { supports }]) => {
          acc[key.toString()] = [toIssueLabelRegex(key)];
          Object.keys(supports ?? {}).forEach((key) => {
            acc[key.toString()] = [toIssueLabelRegex(key)];
          });
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
          .flatMap(([slug, { supports }]) =>
            [slug, ...Object.keys(supports ?? {})].map((key) =>
              `"${toIssueLabel(key)}"`
            )
          )
          .sort()
          .join(", ")
      }`,
    ),
  );

  // .github/pr-labeler.yml
  await writeWithPreamble(
    path.join(REPO_ROOT, ".github/pr-labeler.yml"),
    yaml.stringify(
      Object.entries(userstyles)
        .reduce((acc, [key, { supports }]) => {
          acc[key] = toPrLabel(key);
          Object.keys(supports ?? {}).forEach((supportedKey) => {
            acc[supportedKey] = toPrLabel(key);
          });
          return acc;
        }, {} as Record<string, string>),
    ),
  );

  // .github/labels.yml
  await writeWithPreamble(
    path.join(REPO_ROOT, ".github/labels.yml"),
    yaml.stringify(
      Object.entries(userstyles)
        .reduce(
          (acc, [key, style]) => {
            const base = {
              name: key,
              description: style.name,
              color: style.color
                ? macchiatoHex[style.color]
                : macchiatoHex.blue,
            };

            acc.push(base);

            Object.entries(style.supports ?? {}).forEach(([supportedKey, { name }]) => {
              acc.push({
                ...base,
                name: supportedKey,
                description: name,
              });
            });

            return acc;
          },
          [] as { name: string; description: string; color: string }[],
        ),
    ),
  );
}
