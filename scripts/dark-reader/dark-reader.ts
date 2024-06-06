import { walk } from "https://deno.land/std/fs/mod.ts";
import { ensureFile } from "https://deno.land/std/fs/mod.ts";
import { dirname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";

// Get the directory of the currently running script
const scriptDir = dirname(fromFileUrl(import.meta.url));

// Construct the parentDir to thescript.ts/../../styles
const parentDir = join(scriptDir, "../../styles");

const pattern = /(domain|url-prefix|regexp)\("([^"]+)"\)/g;

async function* getUrls(dir: string): AsyncGenerator<string> {
  for await (const entry of walk(dir, { match: [/catppuccin\.user\.css$/] })) {
    const fileContent = await Deno.readTextFile(entry.path);
    for (const match of fileContent.matchAll(pattern)) {
      const unescapedString = unescape(match[2]);
      yield `/${unescapedString}/`;
    }
  }
}

async function updateJson(origJsonFile: string) {
  const newJsonFile = origJsonFile.replace(/\.json$/, '-new.json');

  // Check if the new JSON file already exists
  try {
    await Deno.stat(newJsonFile);
    throw new Error(`File ${newJsonFile} already exists`);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      throw err;
    }
  }

  const darkJson = JSON.parse(await Deno.readTextFile(origJsonFile));
  const newDisabled = [...darkJson.disabledFor, ...(await collectUrls(parentDir))];
  darkJson.disabledFor = newDisabled;

  // Ensure the new file exists before writing
  await ensureFile(newJsonFile);
  await Deno.writeTextFile(newJsonFile, JSON.stringify(darkJson, null, 2));
}

async function collectUrls(dir: string): Promise<string[]> {
  const urls: string[] = [];
  for await (const url of getUrls(dir)) {
    urls.push(url);
  }
  return urls;
}

// Check if the correct number of arguments is provided
let jsonFile = Deno.args[0];

if (!jsonFile) {
  console.warn(`No JSON file path provided. Falling back to default: ${join(scriptDir, "Dark-Reader-Default-Settings.json")}`);
  jsonFile = join(scriptDir, "Dark-Reader-Default-Settings.json");
}

// Get the JSON file path from the command-line argument or use fallback
updateJson(jsonFile);
