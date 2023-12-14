#!/usr/bin/env -S deno run -A
import usercssMeta from "usercss-meta";
import { ensureDir } from "std/fs/mod.ts";
import { walk } from "std/fs/walk.ts";
import { parse as parseFlags } from "std/flags/mod.ts";
import { join } from "std/path/mod.ts";

import { REPO_ROOT } from "@/deps.ts";
import { checkForMissingFiles } from "@/file-checker.ts";

const flags = parseFlags(Deno.args, { boolean: ["fix"] });
const subDir = flags._[0]?.toString() ?? "";
const stylesheets = walk(join(REPO_ROOT, "styles", subDir), {
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

const data = [settings];

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

// if any files are missing, cause the workflow to fail
if (await checkForMissingFiles() === false) {
  Deno.exit(1);
}
