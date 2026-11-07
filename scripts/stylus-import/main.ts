import { mkdir, readFile, writeFile } from "node:fs/promises";

import usercssMeta from "usercss-meta";
import { getUserstylesFiles } from "#/utils.ts";

// NOTE: Vendored from Stylus (GPL-3.0), as of openstyles/stylus@1c6e3e630208fa32dca1855b780b7c7ad9e03681.
// This should be checked regularly and updated when it changes upstream, so the digests match what Stylus computes.
// https://github.com/openstyles/stylus/blob/master/src/js/style-util.js
async function calcStyleDigest(style: Record<string, any>) {
  const src = style.usercssData
    ? style.sourceCode
    // retain known properties in an arbitrarily predefined order
    : JSON.stringify((style.sections || []).map((section: any) => ({
      code: section.code || "",
      urls: section.urls || [],
      urlPrefixes: section.urlPrefixes || [],
      domains: section.domains || [],
      regexps: section.regexps || [],
    })));
  const srcBytes = new TextEncoder().encode(src);
  const res = await crypto.subtle.digest("SHA-1", srcBytes);
  return Array.from(
    new Uint8Array(res),
    (b) => (0x100 + b).toString(16).slice(1),
  ).join("");
}

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
