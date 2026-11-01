import type { UserstylesSchema } from "#/types/mod.ts";
import { REPO_ROOT, STYLES_ROOT } from "#/constants.ts";

import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";

import path from "node:path";
import Handlebars from "handlebars";
import { formatListOfItems, pluralize } from "#/utils/format.ts";

// we can have some nice things :)
Handlebars.registerHelper("pluralize", pluralize);

const heading = (
  name: UserstylesSchema.Name,
  link: UserstylesSchema.Link,
  supports: UserstylesSchema.Supports | undefined,
) => {
  return [{ title: name, url: link }].concat(
    Object.values(supports ?? {}).map(({ name, link }) => ({
      title: name,
      url: link,
    })),
  );
};

function getNameWithGitHubUrl(
  collaborators?:
    | UserstylesSchema.CurrentMaintainers
    | UserstylesSchema.PastMaintainers,
) {
  // no-op when undefined
  if (!collaborators) return;
  // keep name & set the url to the github.com/<name>
  return collaborators.map((name) => {
    return {
      name,
      url: `https://github.com/${name}`,
    };
  });
}

export function generateStyleReadmes(userstyles: UserstylesSchema.Userstyles) {
  const stylesReadmePath = path.join(
    REPO_ROOT,
    "scripts/generate/templates/userstyle.md",
  );
  const stylesReadmeContent = readFileSync(stylesReadmePath, "utf8");

  Object.entries(userstyles).map(
    (
      [
        slug,
        {
          name,
          link,
          note,
          supports,
          "current-maintainers": currentMaintainers,
          "past-maintainers": pastMaintainers,
        },
      ],
    ) => {
      console.log(`Generating README for styles/${slug}...`);
      const readmeContent = Handlebars.compile(stylesReadmeContent)({
        heading: heading(name, link, supports),
        supportedWebsites: formatListOfItems(
          Object.values(supports ?? {}).map(({ name, link }) =>
            `[${name}](${link})`
          ),
        ),
        slug,
        note,
        collaborators: {
          currentMaintainers: getNameWithGitHubUrl(currentMaintainers),
          pastMaintainers: getNameWithGitHubUrl(pastMaintainers),
        },
      });
      writeFile(
        path.join(STYLES_ROOT, slug.toString(), "README.md"),
        readmeContent,
      ).catch((e) => console.error(e));
    },
  );
}
