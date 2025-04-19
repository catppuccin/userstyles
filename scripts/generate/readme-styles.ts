import type { UserstylesSchema } from "@/types/mod.ts";
import { REPO_ROOT } from "@/constants.ts";

import * as path from "@std/path";
import Handlebars from "handlebars";
import { formatListOfItems } from "@/utils.ts";

// we can have some nice things :)
Handlebars.registerHelper(
  "pluralize",
  (c: number | unknown[], str: string): string => {
    if (typeof c === "undefined") return str;
    const num = Array.isArray(c) ? c.length : c;
    return num === 1 ? str : `${str}s`;
  },
);

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
  const stylesReadmeContent = Deno.readTextFileSync(stylesReadmePath);

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
      Deno.writeTextFile(
        path.join(REPO_ROOT, "styles", slug.toString(), "README.md"),
        readmeContent,
      ).catch((e) => console.error(e));
    },
  );
}
