import { UserStylesSchema } from "@/types/mod.ts";
import { join } from "@std/path";
import { REPO_ROOT } from "@/deps.ts";
import Handlebars from "handlebars";

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
  name: UserStylesSchema.Name,
  link: UserStylesSchema.ApplicationLink,
) => {
  const [nameArray, linkArray] = [[name].flat(), [link].flat()];

  if (nameArray.length !== linkArray.length) {
    throw new Error(
      'The "name" and "app-link" arrays must have the same length',
    );
  }

  return nameArray.map((title, i) => {
    return { title, url: linkArray[i] };
  });
};

const extractName = (
  collaborators?:
    | UserStylesSchema.CurrentMaintainers
    | UserStylesSchema.PastMaintainers,
) => {
  // no-op when undefined
  if (!collaborators) return;
  // set the name to the github.com/<name>
  return collaborators.map((c) => {
    c.name ??= c.url.split("/").pop();
    return c;
  });
};

export const generateStyleReadmes = (
  userstyles: UserStylesSchema.Userstyles,
) => {
  const stylesReadmePath = join(
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
          readme,
          "current-maintainers": currentMaintainers,
          "past-maintainers": pastMaintainers,
        },
      ],
    ) => {
      console.log(`Generating README for ${slug}`);
      const readmeContent = Handlebars.compile(stylesReadmeContent)({
        heading: heading(name, readme["app-link"]),
        slug,
        usage: readme.usage,
        faq: readme.faq,
        collaborators: {
          currentMaintainers: extractName(currentMaintainers),
          pastMaintainers: extractName(pastMaintainers),
        },
      });
      Deno.writeTextFile(
        join(REPO_ROOT, "styles", slug.toString(), "README.md"),
        readmeContent,
      ).catch((e) => console.error(e));
    },
  );
};
