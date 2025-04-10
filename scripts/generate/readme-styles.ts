import type { UserstylesSchema } from "../types/mod.ts";

import path from "node:path";

import Handlebars from "handlebars";

import { REPO_ROOT, STYLES_ROOT } from "../constants.ts";
import { formatListOfItems, pluralize } from "../utils/format.ts";
import { readTextFileSync, writeTextFile } from "../utils/fs.ts";

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
  const stylesReadmeContent = readTextFileSync(stylesReadmePath);

  Object.entries(userstyles).map(
    ([
      slug,
      {
        name,
        link,
        note,
        supports,
        "current-maintainers": currentMaintainers,
        "past-maintainers": pastMaintainers,
      },
    ]) => {
      console.log(`Generating README for styles/${slug}...`);
      const content = Handlebars.compile(stylesReadmeContent)({
        heading: heading(name, link, supports),
        supportedWebsites: formatListOfItems(
          Object.values(supports ?? {}).map(
            ({ name, link }) => `[${name}](${link})`,
          ),
        ),
        slug,
        note,
        collaborators: {
          currentMaintainers: getNameWithGitHubUrl(currentMaintainers),
          pastMaintainers: getNameWithGitHubUrl(pastMaintainers),
        },
      });
      writeTextFile(path.join(STYLES_ROOT, slug, "README.md"), content).catch(
        (e) => console.error(e),
      );
    },
  );
}
