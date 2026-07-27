import { debounce } from "@std/async/debounce";
import { parseArgs } from "@std/cli/parse-args";
import { serveDir } from "@std/http/file-server";
import * as path from "@std/path";
import { createHash } from "node:crypto";

import { REPO_ROOT } from "@/constants.ts";

const DEFAULT_PORT = 8000;
const HOSTNAME = "127.0.0.1";
const USERSTYLE_FILENAME = "catppuccin.user.less";
const REMOTE_ORIGIN = "https://userstyles.catppuccin.com";
const LIB_IMPORT_PATTERN = new RegExp(
  `(@import\\s+(?:\\([^)]*\\)\\s*)?["'])${
    REMOTE_ORIGIN.replaceAll(
      ".",
      "\\.",
    )
  }(/lib/[^"'?#\\s]+\\.less)(?:\\?[^"'\\s]*)?(["'])`,
  "gi",
);

export const HELP_TEXT = `Usage: deno task serve [options] <userstyle>

Serve a userstyle and the local library modules for Stylus live reloading.

Arguments:
  <userstyle>            A slug or path such as github or styles/github

Options:
  -p, --port <port>      Loopback port to use (default: ${DEFAULT_PORT})
  -h, --help             Show this help`;

export type ServeCliOptions =
  | { help: true }
  | { help: false; port: number; userstyle: string };

export function parseUserstyleName(input: string): string {
  const normalized = input.replaceAll("\\", "/").replace(/\/+$/, "");
  const match =
    /^(?:styles\/)?(?<userstyle>[a-z0-9][a-z0-9._-]*)(?:\/catppuccin\.user\.less)?$/
      .exec(normalized);

  if (!match?.groups?.userstyle) {
    throw new Error(
      `Invalid userstyle '${input}'. Expected a slug or path such as github or styles/github.`,
    );
  }

  return match.groups.userstyle;
}

export function parseServeArgs(args: string[]): ServeCliOptions {
  const parsed = parseArgs(args, {
    alias: {
      help: "h",
      port: "p",
    },
    boolean: ["help"],
    default: {
      port: DEFAULT_PORT.toString(),
    },
    string: ["port"],
    unknown(option, key) {
      if (key !== undefined) throw new Error(`Unknown option '${option}'.`);
      return true;
    },
  });

  if (parsed.help) return { help: true };

  if (parsed._.length !== 1) {
    throw new Error(
      "Expected exactly one userstyle argument. Run 'deno task serve --help' for usage.",
    );
  }

  const port = Number(parsed.port);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(
      `Invalid port '${parsed.port}'. Expected an integer from 1 to 65535.`,
    );
  }

  return {
    help: false,
    port,
    userstyle: parseUserstyleName(parsed._[0].toString()),
  };
}

export async function calculateLibChecksum(libPath: string): Promise<string> {
  const files: string[] = [];
  for await (const entry of Deno.readDir(libPath)) {
    if (entry.isFile) files.push(entry.name);
  }
  files.sort();

  const hash = createHash("sha256");
  for (const file of files) {
    const content = await Deno.readTextFile(path.join(libPath, file));
    hash.update(file);
    hash.update("\0");
    hash.update(content);
    hash.update("\0");
  }

  return hash.digest("hex");
}

export function rewriteLibraryImports(
  contents: string,
  serverOrigin: string,
  libChecksum: string,
): string {
  const checksum = libChecksum.slice(0, 6);
  return contents.replace(
    LIB_IMPORT_PATTERN,
    (_match, prefix: string, libUrl: string, suffix: string) =>
      `${prefix}${serverOrigin}${libUrl}?v=${checksum}${suffix}`,
  );
}

interface RequestHandlerOptions {
  getUserstyleContents: () => string;
  libPath: string;
  userstyleRoute: string;
}

export function createRequestHandler(
  options: RequestHandlerOptions,
): (request: Request) => Response | Promise<Response> {
  return (request) => {
    const pathname = new URL(request.url).pathname;

    if (pathname === options.userstyleRoute) {
      return new Response(
        request.method === "HEAD" ? null : options.getUserstyleContents(),
        {
          headers: {
            "cache-control": "no-store",
            "content-type": "text/css; charset=utf-8",
          },
        },
      );
    }

    if (pathname === "/lib" || pathname.startsWith("/lib/")) {
      return serveDir(request, {
        fsRoot: options.libPath,
        quiet: true,
        urlRoot: "lib",
      });
    }

    return new Response("404: Not Found", { status: 404 });
  };
}

async function assertUserstyleExists(userstylePath: string): Promise<void> {
  try {
    const info = await Deno.stat(userstylePath);
    if (!info.isFile) throw new Error();
  } catch {
    throw new Error(`Userstyle not found at '${userstylePath}'.`);
  }
}

export async function main(
  args = Deno.args,
  stopSignal?: AbortSignal,
): Promise<void> {
  const options = parseServeArgs(args);
  if (options.help) {
    console.log(HELP_TEXT);
    return;
  }

  const userstylePath = path.join(
    REPO_ROOT,
    "styles",
    options.userstyle,
    USERSTYLE_FILENAME,
  );
  const libPath = path.join(REPO_ROOT, "lib");
  await assertUserstyleExists(userstylePath);

  const serverOrigin = `http://${HOSTNAME}:${options.port}`;
  const userstyleRoute = `/styles/${options.userstyle}/${USERSTYLE_FILENAME}`;
  let servedUserstyle = "";

  const rebuildUserstyle = async () => {
    const [contents, checksum] = await Promise.all([
      Deno.readTextFile(userstylePath),
      calculateLibChecksum(libPath),
    ]);
    servedUserstyle = rewriteLibraryImports(contents, serverOrigin, checksum);
  };
  await rebuildUserstyle();

  const server = Deno.serve(
    {
      hostname: HOSTNAME,
      onListen() {
        // The URL below is more useful than Deno's default startup log.
      },
      port: options.port,
    },
    createRequestHandler({
      getUserstyleContents: () => servedUserstyle,
      libPath,
      userstyleRoute,
    }),
  );

  console.log(
    `[serve] ${options.userstyle} is available at ${serverOrigin}${userstyleRoute}`,
  );
  console.log("[serve] Press Ctrl+C to stop.");

  let activeReload = Promise.resolve();
  const reload = debounce(() => {
    activeReload = rebuildUserstyle()
      .then(() => console.log(`[serve] Reloaded ${options.userstyle}.`))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : String(error);
        console.error(`[serve] Reload failed: ${message}`);
      });
  }, 200);

  const watcher = Deno.watchFs([userstylePath, libPath]);
  let stopping = false;
  const stop = () => {
    if (stopping) return;
    stopping = true;
    watcher.close();
  };
  const signals: Deno.Signal[] = ["SIGINT"];
  if (Deno.build.os !== "windows") signals.push("SIGTERM");
  for (const signal of signals) Deno.addSignalListener(signal, stop);
  if (stopSignal?.aborted) stop();
  else stopSignal?.addEventListener("abort", stop, { once: true });

  try {
    for await (const _event of watcher) reload();
  } finally {
    reload.clear();
    stopSignal?.removeEventListener("abort", stop);
    for (const signal of signals) Deno.removeSignalListener(signal, stop);
    if (!stopping) watcher.close();
    await activeReload;
    await server.shutdown();
  }
}

if (import.meta.main) {
  try {
    await main();
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`[serve] ${message}`);
    Deno.exitCode = 1;
  }
}
