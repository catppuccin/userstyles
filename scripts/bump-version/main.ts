import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { parseArgs } from "node:util";

import { REPO_ROOT } from "#/constants.ts";
import { CalVer } from "#/bump-version/calver.ts";
import { getUserstylesFiles } from "#/utils/data.ts";

const { values: args, positionals } = parseArgs({
  options: { all: { type: "boolean", default: false } },
  allowPositionals: true,
});

if (!process.env.CI && !args.all) {
  throw new Error(
    "This script should only be used in CI. Userstyle versions are automatically bumped after pull requests are merged.",
  );
}

let files = [];

if (args.all) {
  files = getUserstylesFiles();
} else {
  files = positionals.map((p) => path.join(REPO_ROOT, p));
}

for (
  const file of files
) {
  const content = await readFile(file, "utf8");

  const metadataMatches = content.match(
    /^\/\*\s*==UserStyle==[\s\S]*?==\/UserStyle==\s*\*\//,
  );
  if (!metadataMatches) {
    throw new Error(`No metadata found in ${file}`);
  }
  const metadata = metadataMatches[0];
  const post = content.slice(metadata.length);

  const versionMatches = metadata.match(/@version(\s+)(.*)/);
  if (!versionMatches) {
    throw new Error(`No version found in ${file}`);
  }
  const whitespace = versionMatches[1];

  const version = new CalVer(versionMatches[2]);
  version.incrementWith(new Date());

  const newContent = metadata.replace(
    /@version\s+.*/,
    `@version${whitespace}${version.toString()}`,
  ) + post;

  await writeFile(file, newContent);
}
