import { join } from "std/path/mod.ts";

import { REPO_ROOT } from "@/deps.ts";
import { updateFile } from "@/generate/utils.ts";
import { UserStylesSchema } from "@/types/mod.d.ts";

export const syncIssueLabels = (userstyles: UserStylesSchema.Userstyles) => {
  const ISSUE_PREFIX = "lbl:";

  const issuesLabelerPath = join(REPO_ROOT, ".github/issue-labeler.yml");
  const issuesLabelerContent = Object.entries(userstyles)
    .map(([key]) => `${key}: ["(${ISSUE_PREFIX + key})"]`)
    .join("\n");
  updateFile(issuesLabelerPath, issuesLabelerContent);

  const userstyleIssuePath = join(
    REPO_ROOT,
    "scripts/generate/templates/userstyle-issue.yml",
  );
  const userstyleIssueContent = Deno.readTextFileSync(userstyleIssuePath);

  const replacedUserstyleIssueContent = userstyleIssueContent.replace(
    "$PORTS",
    `${
      Object.entries(userstyles)
        .map(([key]) => `'${ISSUE_PREFIX + key}'`)
        .join(", ")
    }`,
  );
  Deno.writeTextFileSync(
    join(REPO_ROOT, ".github/ISSUE_TEMPLATE/userstyle.yml"),
    replacedUserstyleIssueContent,
  );

  const pullRequestLabelerPath = join(REPO_ROOT, ".github/pr-labeler.yml");
  const pullRequestLabelerContent = Object.entries(userstyles)
    .map(([key]) => `${key}: styles/${key}/**/*`)
    .join("\n");
  updateFile(pullRequestLabelerPath, pullRequestLabelerContent);

  const syncLabels = join(REPO_ROOT, ".github/labels.yml");
  const syncLabelsContent = Object.entries(userstyles)
    .map(
      ([key, style]) =>
        `- name: ${key}
  description: ${style.name}
  color: "#8aadf4"`,
    ).join("\n");
  updateFile(syncLabels, syncLabelsContent);
};
