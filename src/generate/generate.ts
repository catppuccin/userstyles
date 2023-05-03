#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net
import {
  Ajv,
  parseYaml,
  path,
  portsSchema,
  schema,
  PortCategories,
} from "./deps.ts";
import {
  FAQ,
  Userstyle,
  UserstyleMaintainers,
  Userstyles,
  Usage,
  ApplicationLink,
  Name,
} from "./types.d.ts";

const ROOT = new URL(".", import.meta.url).pathname;
const REPO_ROOT = path.join(ROOT, "../..");

type Metadata = {
  userstyles: Userstyles;
};

type PortMetadata = {
  categories: PortCategories;
};

export type MappedPort = Userstyle & { path: string };

const ajv = new (Ajv as unknown as (typeof Ajv)["default"])();
const validate = ajv.compile<Metadata>(schema);
const validatePorts = ajv.compile<PortMetadata>(portsSchema);

const userstylesYaml = Deno.readTextFileSync(
  path.join(ROOT, "../userstyles.yml")
);
const userstylesData = parseYaml(userstylesYaml);
if (!validate(userstylesData)) {
  console.log(validate.errors);
  Deno.exit(1);
}

const portsYaml = await fetch(
  "https://raw.githubusercontent.com/catppuccin/catppuccin/main/resources/ports.yml"
);
const portsData = parseYaml(await portsYaml.text());
if (!validatePorts(portsData)) {
  console.log(validate.errors);
  Deno.exit(1);
}

const categorized = Object.entries(userstylesData.userstyles).reduce(
  (acc, [slug, { category, ...port }]) => {
    acc[category] ||= [];
    acc[category].push({ path: `styles/${slug}`, category, ...port });
    acc[category].sort((a, b) => {
      const aName = typeof a.name === "string" ? a.name : a.name.join(", ");
      const bName = typeof b.name === "string" ? b.name : b.name.join(", ");
      return aName.localeCompare(bName);
    });
    return acc;
  },
  {} as Record<string, MappedPort[]>
);

const portListData = portsData.categories
  .filter((category) => categorized[category.key] !== undefined)
  .map((category) => {
    return {
      meta: category,
      ports: categorized[category.key],
    };
  });

const portContent = portListData
  .map(
    (data) => `<details open>
<summary>${data.meta.emoji} ${data.meta.name}</summary>

${data.ports
  .map((port) => {
    const name = Array.isArray(port.name) ? port.name.join(", ") : port.name;
    return `- [${name}](${port.path})`;
  })
  .join("\n")}

</details>`
  )
  .join("\n");

const updateReadme = ({
  readme,
  section,
  newContent,
}: {
  readme: string;
  section: string;
  newContent: string;
}): string => {
  const preamble =
    "<!-- the following section is auto-generated, do not edit -->";
  const startMarker = `<!-- AUTOGEN:${section.toUpperCase()} START -->`;
  const endMarker = `<!-- AUTOGEN:${section.toUpperCase()} END -->`;
  const wrapped = `${startMarker}\n${preamble}\n${newContent}\n${endMarker}`;

  if (
    !(readmeContent.includes(startMarker) && readmeContent.includes(endMarker))
  ) {
    throw new Error("Markers not found in README.md");
  }

  const pre = readme.split(startMarker)[0];
  const end = readme.split(endMarker)[1];
  return pre + wrapped + end;
};

const updateFile = (filePath: string, fileContent: string, comment = true) => {
  const preamble = comment
    ? "# THIS FILE IS AUTOGENERATED. DO NOT EDIT IT BY HAND.\n"
    : "";
  Deno.writeTextFileSync(filePath, preamble + fileContent);
};

const readmePath = path.join(REPO_ROOT, "README.md");
let readmeContent = Deno.readTextFileSync(readmePath);
try {
  readmeContent = updateReadme({
    readme: readmeContent,
    section: "userstyles",
    newContent: portContent,
  });
  updateFile(readmePath, readmeContent, false);
} catch (e) {
  console.log("Failed to update the README:", e);
}

const pullRequestLabelerPath = path.join(REPO_ROOT, ".github/pr-labeler.yml");
const pullRequestLabelerContent = Object.entries(userstylesData.userstyles)
  .map(([key]) => `${key}: styles/${key}/**/*`)
  .join("\n");
updateFile(pullRequestLabelerPath, pullRequestLabelerContent);

const issuesLabelerPath = path.join(REPO_ROOT, ".github/issue-labeler.yml");
const issuesLabelerContent = Object.entries(userstylesData.userstyles)
  .map(([key]) => {
    return `${key}:
  - '(lbl:${key})'`;
  })
  .join("\n");
updateFile(issuesLabelerPath, issuesLabelerContent);

const ownersPath = path.join(REPO_ROOT, ".github/CODEOWNERS");
const ownersContent = Object.entries(userstylesData.userstyles)
  .map(([key, style]) => {
    const maintainers = style.readme.maintainers
      .map((maintainer) => `@${maintainer.url.split("/").pop()}`)
      .join(" ");
    return `# /styles/${key} ${maintainers}`;
  })
  .join("\n#\n");
updateFile(ownersPath, ownersContent);

const userstyleIssuePath = path.join(ROOT, "templates/userstyle-issue.yml");
const userstyleIssueContent = Deno.readTextFileSync(userstyleIssuePath);
const replacedUserstyleIssueContent = userstyleIssueContent.replace(
  "$PORTS",
  `${Object.entries(userstylesData.userstyles)
    .map(([key]) => `- ${key}`)
    .join("\n        ")}`
);
Deno.writeTextFileSync(
  path.join(REPO_ROOT, ".github/ISSUE_TEMPLATE/userstyle.yml"),
  replacedUserstyleIssueContent
);

const heading = (name: Name, link: ApplicationLink) => {
  const nameArray = Array.isArray(name) ? name : [name];
  const linkArray = Array.isArray(link) ? link : [link];

  if (nameArray.length !== linkArray.length) {
    throw new Error(
      'The "name" and "app-link" arrays must have the same length'
    );
  }

  return `Catppuccin for ${nameArray
    .map((name, index) => `<a href="${linkArray[index]}">${name}</a>`)
    .join(", ")}`;
};

const usageContent = (usage?: Usage) => {
  if (!usage) {
    return "";
  }
  return `## Usage  \n${usage}`;
};

const faqContent = (faq?: FAQ) => {
  if (!faq) {
    return "";
  }
  return `## 🙋 FAQ
${faq
  .map(({ question, answer }) => `- Q: ${question}  \n\tA: ${answer}`)
  .join("\n")}`;
};

const maintainersContent = (maintainers: UserstyleMaintainers) => {
  return maintainers
    .map(({ name, url }) => {
      return `- [${name === undefined ? url.split("/").pop() : name}](${url})`;
    })
    .join("\n");
};

const updateStylesReadmeContent = (
  readme: string,
  key: string,
  userstyle: Userstyle
) => {
  return readme
    .replace("$TITLE", heading(userstyle.name, userstyle.readme["app-link"]))
    .replaceAll("$LOWERCASE-PORT", key)
    .replace("$USAGE", usageContent(userstyle.readme.usage))
    .replace("$FAQ", faqContent(userstyle.readme.faq))
    .replace("$MAINTAINERS", maintainersContent(userstyle.readme.maintainers));
};

const stylesReadmePath = path.join(ROOT, "templates/userstyle.md");
const stylesReadmeContent = Deno.readTextFileSync(stylesReadmePath);
for (const [key, userstyle] of Object.entries(userstylesData.userstyles)) {
  try {
    console.log(`Generating README for ${key}`);
    readmeContent = updateStylesReadmeContent(
      stylesReadmeContent,
      key,
      userstyle
    );
    Deno.writeTextFileSync(
      path.join(REPO_ROOT, "styles", key, "README.md"),
      readmeContent
    );
  } catch (e) {
    console.log(`Failed to update ${userstyle} README:`, e);
  }
}
