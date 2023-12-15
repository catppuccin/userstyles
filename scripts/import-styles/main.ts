#!/usr/bin/env -S deno run -A
import usercssMeta from "usercss-meta";
import { ensureDir } from "std/fs/mod.ts";
import { walk } from "std/fs/walk.ts";
import { join } from "std/path/mod.ts";

import { REPO_ROOT } from "@/deps.ts";

const stylesheets = walk(join(REPO_ROOT, "styles"), {
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
  },
};

const data: Record<string, unknown>[] = [settings];

for await (const entry of stylesheets) {
  const content = await Deno.readTextFile(entry.path);
  const { metadata } = usercssMeta.parse(content);

  data.push({
    enabled: true,
    name: metadata.name,
    description: metadata.description,
    author: metadata.author,
    url: metadata.url,
    updateUrl: metadata.updateURL,
    usercssData: metadata,
    sourceCode: content,
  });
}

ensureDir("dist");
Deno.writeTextFile("dist/import.json", JSON.stringify(data));
