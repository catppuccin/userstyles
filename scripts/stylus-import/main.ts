import usercssMeta from "usercss-meta";
import { ensureDir } from "@std/fs";
import { calcStyleDigest } from "https://github.com/openstyles/stylus/raw/8fe35a4b90d85fb911bd7aa1deab4e4733c31150/src/js/sections-util.js";
import { getUserstylesFiles } from "@/utils.ts";

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
  const content = await Deno.readTextFile(file);
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
await Deno.writeTextFile("dist/import.json", JSON.stringify(data));
