import path from "node:path";

import { REPO_ROOT } from "../constants.ts";
import { CalVer } from "./calver.ts";
import parseArgs from "tiny-parse-argv";
import { getUserstylesFiles } from "../utils/data.ts";
import { readTextFile, writeTextFile } from "../utils/fs.ts";

const args = parseArgs(process.argv.slice(2), { boolean: ["all"] });

if (!process.env["CI"] && !args.all) {
  throw new Error(
    "This script should only be used in CI. Userstyle versions are automatically bumped after pull requests are merged.",
  );
}

let files: string[] = [];

if (args.all) {
  files = getUserstylesFiles();
} else {
  files = args._.filter((val) => typeof val == "string").map((p: string) =>
    path.join(REPO_ROOT, p)
  );
}

for (
  const file of files
) {
  const content = await readTextFile(file);

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

  await writeTextFile(file, newContent);
}
