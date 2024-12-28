import * as path from "@std/path";

import { REPO_ROOT } from "@/constants.ts";
import { CalVer } from "@/bump-version/calver.ts";
import { parseArgs } from "@std/cli";

const args = parseArgs(Deno.args, { boolean: ["all"] });

if (!Deno.env.get("CI") && !args.all) {
  throw new Error(
    "This script is not intended to be used manually. Userstyle versions are automatically bumped after pull requests are merged.",
  );
}

let dirs = [];

if (args.all) {
  for (const dir of Deno.readDirSync(path.join(REPO_ROOT, "styles"))) {
    if (!dir.isDirectory) continue;
    dirs.push(path.join(REPO_ROOT, "styles", dir.name));
  }
} else {
  dirs = args._.filter((val) => typeof val == "string").map((dir: string) =>
    path.join(REPO_ROOT, dir)
  );
}

for (
  const dir of dirs
) {
  const file = path.join(dir, "catppuccin.user.css");
  const content = await Deno.readTextFile(file);

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

  await Deno.writeTextFile(file, newContent);
}
