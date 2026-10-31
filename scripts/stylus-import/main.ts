import { mkdir, readFile, writeFile } from "node:fs/promises";

import usercssMeta from "usercss-meta";
import { getUserstylesFiles } from "#/utils.ts";

// Stylus isn't published as a package, so import the module straight from GitHub.
const { calcStyleDigest } = await import(
  "data:text/javascript," + encodeURIComponent(
    await fetch(
      "https://raw.githubusercontent.com/openstyles/stylus/8fe35a4b90d85fb911bd7aa1deab4e4733c31150/src/js/sections-util.js",
    ).then((res) => res.text()),
  )
);

// Recommended settings.
const settings = {
  settings: {
    updateInterval: 24,
    updateOnlyEnabled: true,
    patchCsp: true,
    "editor.linter": "",
  },
};

const data: Record<string, unknown>[] = [settings];

for (const file of getUserstylesFiles()) {
  const content = await readFile(file, "utf8");
  const { metadata } = usercssMeta.parse(content);

  const userstyle = {
    enabled: true,
    name: metadata.name,
    description: metadata.description,
    author: metadata.author,
    url: metadata.url,
    updateUrl: metadata.updateURL,
    usercssData: metadata,
    sourceCode: content,
  } as Record<string, unknown>;

  userstyle.originalDigest = await calcStyleDigest(userstyle);

  data.push(userstyle);
}

await mkdir("dist", { recursive: true });
await writeFile("dist/import.json", JSON.stringify(data));
