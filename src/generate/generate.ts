#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write --allow-net
import { Ajv, parseYaml, path, portsSchema, schema, PortCategories } from "./deps.ts";
import { Userstyle, Userstyles } from "./types.d.ts";

const ROOT = new URL(".", import.meta.url).pathname;

type Metadata = {
  userstyles: Userstyles;
};

type PortMetadata = {
  categories: PortCategories;
};

export type MappedPort = Userstyle & { path: string };

const ajv = new Ajv();
const validate = ajv.compile<Metadata>(schema);
const validatePorts = ajv.compile<PortMetadata>(portsSchema);

const userstylesYaml = Deno.readTextFileSync(path.join(ROOT, "../userstyles.yml"));
const userstylesData = parseYaml(userstylesYaml) as Metadata;
if (!validate(userstylesData)) {
  console.log(validate.errors);
  Deno.exit(1);
}

const portsYaml = await fetch("https://raw.githubusercontent.com/catppuccin/catppuccin/main/resources/ports.yml");
const portsData = parseYaml(await portsYaml.text()) as PortMetadata;
if (!validatePorts(portsData)) {
  console.log(validate.errors);
  Deno.exit(1);
}

const categorized = Object.entries(userstylesData.userstyles).reduce(
  (acc, [ slug, { category, ...port } ]) => {
    acc[category] ||= [];
    acc[category].push({ path: `styles/${slug}`, ...port });
    acc[category].sort((a, b) => a.name.localeCompare(b.name));
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

const portContent = portListData.map(data => `<details open>
<summary>${data.meta.emoji} ${data.meta.name}</summary>

${data.ports.map(port => `- [${port.name}](${port.path})`).join("\n")}

</details>`
).join("\n");

const updateReadme = (
  {
    readme,
    section,
    newContent,
  }: {
    readme: string;
    section: string;
    newContent: string;
  }): string => {
  const preamble = "<!-- the following section is auto-generated, do not edit -->";
  const startMarker = `<!-- AUTOGEN:${section.toUpperCase()} START -->`;
  const endMarker = `<!-- AUTOGEN:${section.toUpperCase()} END -->`;
  const wrapped = `${startMarker}\n${preamble}\n${newContent}\n${endMarker}`

  if (!(readmeContent.includes(startMarker) && readmeContent.includes(endMarker))) {
    throw new Error("Markers not found in README.md");
  }

  const pre = readme.split(startMarker)[0];
  const end = readme.split(endMarker)[1];
  return pre + wrapped + end;
};

const updateFile = (filePath: string, fileContent: string, comment = true) => {
  const preamble = comment ? "# THIS FILE IS AUTOGENERATED. DO NOT EDIT IT BY HAND.\n" : "";
  Deno.writeTextFileSync(filePath, preamble + fileContent);
};

const readmePath = path.join(ROOT, "../../README.md")
let readmeContent = Deno.readTextFileSync(readmePath);
try {
  readmeContent = updateReadme({
    readme: readmeContent,
    section: "userstyles",
    newContent: portContent,
  });
} catch (e) {
  console.log("Failed to update the README:", e);
} finally {
  updateFile(readmePath, readmeContent, false);
}

const labelerPath = path.join(ROOT, "../../.github/labeler.yml");
const labelerContent = Object.entries(userstylesData.userstyles)
  .map(([ key ]) => `${key}: styles/${key}/**/*`)
  .join("\n");
updateFile(labelerPath, labelerContent);

const ownersPath = path.join(ROOT, "../../.github/CODEOWNERS");
const ownersContent = Object.entries(userstylesData.userstyles)
  .map(([ key, style ]) => {
    const maintainers = style.readme.maintainers.map((maintainer) => `@${maintainer.url.split("/").pop()}`).join(" ");
    return `# /styles/${key} ${maintainers}`;
  }).join("\n#\n");
updateFile(ownersPath, ownersContent);