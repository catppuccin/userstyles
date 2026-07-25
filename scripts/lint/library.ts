import * as path from "@std/path";
// @ts-types="npm:@types/less";
import less from "less";

import { REPO_ROOT } from "@/constants.ts";

const LIB_URL_PREFIX = "https://userstyles.catppuccin.com/lib";
const LIB_DIRECTORY = path.join(REPO_ROOT, "lib");

class InterceptingFileManager extends less.FileManager {
  #cache = new Map<string, Promise<string>>();

  override supports(filename: string) {
    return filename.startsWith(LIB_URL_PREFIX);
  }
  override supportsSync() {
    return false;
  }

  override async loadFile(
    filename: string,
    _currentDirectory: string,
    _options: Less.LoadFileOptions,
    _environment: Less.Environment,
  ): Promise<Less.FileLoadResult> {
    const relativePath = filename.slice(LIB_URL_PREFIX.length);
    const localPath = path.join(LIB_DIRECTORY, relativePath);

    let cached = this.#cache.get(localPath);
    if (!cached) {
      cached = Deno.readTextFile(localPath).catch(() => {
        throw {
          type: "File",
          message: `${filename} failed: not found at ${localPath}`,
        };
      });
      this.#cache.set(localPath, cached);
    }

    return { contents: await cached, filename: localPath };
  }
}

interface LessEnvironment {
  addFileManager(fileManager: Less.FileManager): void;
}

(less as unknown as { environment: LessEnvironment }).environment
  .addFileManager(
    new InterceptingFileManager(),
  );
