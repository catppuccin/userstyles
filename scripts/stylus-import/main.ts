import { REPO_ROOT } from "@/constants.ts";

import * as path from "@std/path";
import usercssMeta from "usercss-meta";
import { ensureDir, walk } from "@std/fs";
import { calcStyleDigest } from "https://github.com/openstyles/stylus/raw/8fe35a4b90d85fb911bd7aa1deab4e4733c31150/src/js/sections-util.js";

const stylesheets = walk(path.join(REPO_ROOT, "styles"), {
  includeFiles: true,
  includeDirs: false,
  includeSymlinks: false,
  match: [/\.user.css$/],
});

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

for await (const entry of stylesheets) {
  const content = await Deno.readTextFile(entry.path);
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
Deno.writeTextFile("dist/import.json", JSON.stringify(data));
