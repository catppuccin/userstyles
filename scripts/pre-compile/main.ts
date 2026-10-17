import * as path from "@std/path";
import { getUserstylesFiles } from "../utils.ts";
import { REPO_ROOT } from "../constants.ts";
import { ensureDir } from "@std/fs";

const stylesheets = getUserstylesFiles();
const modules = await getLibraryModules();

const DIST_ROOT = path.join(REPO_ROOT, "dist");
ensureDir(DIST_ROOT);

for (const style of stylesheets) {
  const dir = path.basename(path.dirname(style));
  const content = await Deno.readTextFile(style);
  await Deno.writeTextFile(
    path.join(DIST_ROOT, `${dir}.user.css`),
    replaceLibraryModules(content),
  );
}

function replaceLibraryModules(userstyle: string): string {
  return userstyle.replace(
    new RegExp(
      `${
        RegExp.escape('@import "https://userstyles.catppuccin.com/lib/')
      }(.*)";`,
      "g",
    ),
    (substring, module) => {
      return modules[module as keyof typeof modules].trim();
    },
  );
}

async function getLibraryModules(): Promise<Record<string, string>> {
  const LIB_ROOT = path.join(REPO_ROOT, "lib");
  const modules: Record<string, string> = {};
  for (
    const module of Deno.readDirSync(LIB_ROOT)
  ) {
    if (!module.isDirectory) {
      modules[module.name] = await Deno.readTextFile(
        path.join(LIB_ROOT, module.name),
      );
    }
  }
  return modules;
}
