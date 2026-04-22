import { parseArgs } from "@std/cli";
import { serveDir } from "@std/http/file-server";
import { debounce } from "@std/async/debounce";
import { createHash } from "node:crypto";

import * as path from "@std/path";

import { REPO_ROOT } from "@/constants.ts";

const args = parseArgs(Deno.args, {});
const userstyle = args._[0]
  ?.toString()
  .match(
    /(?<base>styles\/)?(?<userstyle>[a-z0-9_\-.]+)(?<trailing>\/)?(?<file>catppuccin\.user\.less)?/,
  )?.groups?.userstyle;
if (!userstyle) throw new Error("Invalid userstyle argument");

const server = Deno.serve({
  onListen() {
    // Disable unnecessary post-startup log.
  },
}, (req: Request) => {
  const pathname = new URL(req.url).pathname;

  if (pathname.startsWith("/lib")) {
    return serveDir(req, {
      fsRoot: "lib",
      urlRoot: "lib",
    });
  }

  return new Response("404: Not Found", {
    status: 404,
  });
});

const userstylePath = path.join(
  REPO_ROOT,
  "styles",
  userstyle,
  "catppuccin.user.less",
);

const libPath = path.join(
  REPO_ROOT,
  "lib",
);

const tempUserstylePath = await Deno.makeTempFile({
  prefix: "userstyle_",
  suffix: ".user.less",
});

async function calculateLibChecksum(): Promise<string> {
  const files = [];
  for await (const entry of Deno.readDir(libPath)) {
    if (entry.isFile) {
      files.push(path.join(libPath, entry.name));
    }
  }

  const hash = createHash("sha256");
  for (const file of files) {
    const content = await Deno.readTextFile(file);
    hash.update(content);
  }

  return hash.digest("hex");
}

let lastLibChecksum = await calculateLibChecksum();

async function updateTempUserstyle() {
  let contents = await Deno.readTextFile(userstylePath);
/* Appends a query parameter suffix to import URLs from userstyles.catppuccin.com, containing the library modules content checksum.  */
  const importRegex =
    /(@import\s+"https:\/\/userstyles\.catppuccin\.com\/lib\/[^\s]+\.less")/g;
  contents = contents.replace(importRegex, (match) => {
    return match.replace(
      /(\.less)/,
      `$1?v=${lastLibChecksum.slice(0, 6)}`,
    );
  });

  /* Then replace the remote userstyles.catppuccin.com host with the local(host) server URL for these imports. */
  contents = contents.replaceAll(
    "https://userstyles.catppuccin.com",
    `http://localhost:${server.addr.port}`,
  );

  await Deno.writeTextFile(tempUserstylePath, contents);
}

updateTempUserstyle();

console.log(`[serve] ${userstyle} userstyle served at '${tempUserstylePath}'`);

const reload = debounce(() => {
  console.log(
    `[serve]: reloaded ${userstyle} userstyle`,
  );
  updateTempUserstyle();
}, 200);

const watcher = Deno.watchFs([userstylePath, libPath]);
for await (const event of watcher) {
  if (event.paths.some((path) => path.startsWith(libPath))) {
    lastLibChecksum = await calculateLibChecksum();
  }
  reload();
}
