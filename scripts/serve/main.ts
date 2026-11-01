import { createHash } from "node:crypto";
import { watch } from "node:fs";
import { mkdtemp, readdir, readFile, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";
import { parseArgs } from "node:util";

import { REPO_ROOT, STYLES_ROOT } from "#/constants.ts";
import { parseUserstyleArgument } from "#/utils/data.ts";

const PORT = 8000;

const { positionals } = parseArgs({ allowPositionals: true });
const userstyle = parseUserstyleArgument(positionals[0]);
if (!userstyle) throw new Error("Invalid userstyle argument");

createServer(async (req, res) => {
  const pathname = new URL(req.url!, `http://localhost:${PORT}`).pathname;

  if (pathname.startsWith("/lib")) {
    try {
      return res.end(await readFile(path.join(".", pathname)));
    } catch {
      // Fall through to the 404 response.
    }
  }

  res.statusCode = 404;
  res.end("404: Not Found");
}).listen(PORT);

const userstylePath = path.join(STYLES_ROOT, userstyle, "catppuccin.user.less");

const libPath = path.join(
  REPO_ROOT,
  "lib",
);

const tempUserstylePath = path.join(
  await mkdtemp(path.join(tmpdir(), "userstyle_")),
  "catppuccin.user.less",
);

async function calculateLibChecksum(): Promise<string> {
  const files = [];
  for (const entry of await readdir(libPath, { withFileTypes: true })) {
    if (entry.isFile()) {
      files.push(path.join(libPath, entry.name));
    }
  }

  const hash = createHash("sha256");
  for (const file of files) {
    const content = await readFile(file, "utf8");
    hash.update(content);
  }

  return hash.digest("hex");
}

let lastLibChecksum = await calculateLibChecksum();

async function updateTempUserstyle() {
  let contents = await readFile(userstylePath, "utf8");
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
    `http://localhost:${PORT}`,
  );

  await writeFile(tempUserstylePath, contents);
}

updateTempUserstyle();

console.log(`[serve] ${userstyle} userstyle served at '${tempUserstylePath}'`);

let reloadTimeout: ReturnType<typeof setTimeout> | undefined;
function reload() {
  clearTimeout(reloadTimeout);
  reloadTimeout = setTimeout(() => {
    console.log(
      `[serve]: reloaded ${userstyle} userstyle`,
    );
    updateTempUserstyle();
  }, 200);
}

for (const watchPath of [userstylePath, libPath]) {
  watch(watchPath, { recursive: true }, async () => {
    if (watchPath === libPath) {
      lastLibChecksum = await calculateLibChecksum();
    }
    reload();
  });
}
