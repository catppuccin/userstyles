#!/usr/bin/env -S deno run -A
import usercssMeta from "usercss-meta";
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

// settings that we want for each user to apply
const settings = JSON.stringify({
    settings: {
      updateInterval: 24,
      updateOnlyEnabled: true,
      patchCsp: true
    }
  })

var data = '[' + settings + ',';

const entries = [];
for await (const entry of stylesheets) {
  entries.push(entry);
}

for (let i = 0; i < entries.length; i++) {
  let content = await Deno.readTextFile(entries[i].path);

  const {metadata} = usercssMeta.parse(content);

  const final = JSON.stringify({
    enabled: true,
    name: metadata.name,
    description: metadata.description,
    author: metadata.author,
    url: metadata.url,
    updateUrl: metadata.updateURL,
    usercssData: metadata,
    sourceCode: content
  });
  
  let closingTag = ',';
  if (i === entries.length - 1) {
    closingTag = ']';
  }

  data += final + closingTag;
}

Deno.writeFile("compiled.json", new TextEncoder().encode(data))

// if any files are missing, cause the workflow to fail
if (await checkForMissingFiles() === false) {
  Deno.exit(1);
}
