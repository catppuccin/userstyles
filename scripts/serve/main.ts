import { parseArgs } from "@std/cli";
import { debounce } from "@std/async/debounce";

import * as path from "@std/path";

import { REPO_ROOT } from "@/constants.ts";

const args = parseArgs(Deno.args, { boolean: ["fix"] });
const userstyle = args._[0]
  ?.toString()
  .match(
    /(?<base>styles\/)?(?<userstyle>[a-z0-9_\-.]+)(?<trailing>\/)?(?<file>catppuccin\.user\.less)?/,
  )?.groups?.userstyle;
if (!userstyle) throw new Error("Invalid userstyle argument");

const userstylePath = path.join(
  REPO_ROOT,
  "styles",
  userstyle,
  "catppuccin.user.less",
);

const tempUserstylePath = await Deno.makeTempFile({
  prefix: "userstyle_",
  suffix: ".user.less",
});

updateTempUserstyle();

console.log(`[serve]: dev userstyle at '${tempUserstylePath}'`);

const watcher = Deno.watchFs(userstylePath);

const reload = debounce(() => {
  console.log(
    `watcher: reloaded ${userstyle} userstyle`,
  );
  updateTempUserstyle();
}, 200);

for await (const event of watcher) {
  reload();
}

async function updateTempUserstyle() {
  let contents = await Deno.readTextFile(userstylePath);
  contents = contents.replaceAll(
    "https://userstyles.catppuccin.com/lib",
    "file://" + path.join(REPO_ROOT, "lib"),
  ); // TODO: Bundle library modules instead of rewriting import paths.
  await Deno.writeTextFile(tempUserstylePath, contents);
}
