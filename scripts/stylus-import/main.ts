import usercssMeta from "usercss-meta";
import { calcStyleDigest } from "@openstyles/stylus/src/js/sections-util.js";
import { getUserstylesFiles } from "../utils/data.ts";
import { ensureDir, readTextFile, writeTextFile } from "../utils/fs.ts";

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
  const content = await readTextFile(file);
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

await ensureDir("dist");
await writeTextFile("dist/import.json", JSON.stringify(data));
