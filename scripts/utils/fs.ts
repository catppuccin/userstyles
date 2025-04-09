import fs, { type Dirent } from 'node:fs';
import fsp from 'node:fs/promises';

export async function readTextFile(
  path: string,
): Promise<string> {
  return fsp.readFile(path, "utf-8");
}

export async function writeTextFile(
  path: string,
  content: string,
): Promise<void> {
  return fsp.writeFile(path, content);
}

export function readTextFileSync(
  path: string,
): string {
  return fs.readFileSync(path, "utf-8");
}

export function writeTextFileSync(
  path: string,
  content: string,
): void {
  return fs.writeFileSync(path, content);
}

export async function readDir(
  path: string,
  recursive: boolean = false
): Promise<Dirent[]> {
  return fsp.readdir(path, { withFileTypes: true, recursive });
}


export function readDirSync(
  path: string,
  recursive: boolean = false
): Dirent[] {
  return fs.readdirSync(path, { withFileTypes: true, recursive });
}

export async function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    await fsp.mkdir(dir, { recursive: true });
  }
}
