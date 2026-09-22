import { assertEquals, assertNotEquals, assertThrows } from "@std/assert";
import * as path from "@std/path";
import { REPO_ROOT } from "@/constants.ts";
// @ts-types="npm:@types/less";
import less from "less";

import {
  calculateLibChecksum,
  createRequestHandler,
  main,
  parseServeArgs,
  rewriteLibraryImports,
} from "@/serve/main.ts";

Deno.test("parseServeArgs accepts userstyle slugs and paths", () => {
  assertEquals(parseServeArgs(["github"]), {
    help: false,
    port: 8000,
    userstyle: "github",
  });
  assertEquals(
    parseServeArgs(["--port", "8123", "styles\\github\\catppuccin.user.less"]),
    {
      help: false,
      port: 8123,
      userstyle: "github",
    },
  );
  assertEquals(parseServeArgs(["--help"]), { help: true });
});

Deno.test("parseServeArgs rejects ambiguous or unsafe arguments", () => {
  assertThrows(
    () => parseServeArgs([]),
    Error,
    "Expected exactly one userstyle argument",
  );
  assertThrows(
    () => parseServeArgs(["github", "youtube"]),
    Error,
    "Expected exactly one userstyle argument",
  );
  assertThrows(
    () => parseServeArgs(["../github"]),
    Error,
    "Invalid userstyle",
  );
  assertThrows(
    () => parseServeArgs(["--port", "0", "github"]),
    Error,
    "Invalid port",
  );
  assertThrows(
    () => parseServeArgs(["--unknown", "github"]),
    Error,
    "Unknown option",
  );
});

Deno.test("rewriteLibraryImports localizes only library imports", () => {
  const source = `@import "https://userstyles.catppuccin.com/lib/lib.less";
@import (reference) 'https://userstyles.catppuccin.com/lib/module.less?old=1';
/* https://userstyles.catppuccin.com/lib/comment.less */
@source "https://userstyles.catppuccin.com/styles/example";`;

  assertEquals(
    rewriteLibraryImports(source, "http://127.0.0.1:8123", "abcdef123456"),
    `@import "http://127.0.0.1:8123/lib/lib.less?v=abcdef";
@import (reference) 'http://127.0.0.1:8123/lib/module.less?v=abcdef';
/* https://userstyles.catppuccin.com/lib/comment.less */
@source "https://userstyles.catppuccin.com/styles/example";`,
  );
});

Deno.test("calculateLibChecksum is independent of directory iteration order", async () => {
  const first = await Deno.makeTempDir();
  const second = await Deno.makeTempDir();

  try {
    await Deno.writeTextFile(`${first}/a.less`, "alpha");
    await Deno.writeTextFile(`${first}/b.less`, "beta");
    await Deno.writeTextFile(`${second}/b.less`, "beta");
    await Deno.writeTextFile(`${second}/a.less`, "alpha");

    assertEquals(
      await calculateLibChecksum(first),
      await calculateLibChecksum(second),
    );

    await Deno.writeTextFile(`${second}/a.less`, "changed");
    assertNotEquals(
      await calculateLibChecksum(first),
      await calculateLibChecksum(second),
    );
  } finally {
    await Deno.remove(first, { recursive: true });
    await Deno.remove(second, { recursive: true });
  }
});

Deno.test("createRequestHandler serves the generated userstyle", async () => {
  const handler = createRequestHandler({
    getUserstyleContents: () => "generated contents",
    libPath: "lib",
    userstyleRoute: "/styles/github/catppuccin.user.less",
    rewriteLibraryContents: (contents) => contents,
  });

  const response = await handler(
    new Request("http://127.0.0.1/styles/github/catppuccin.user.less"),
  );
  assertEquals(response.status, 200);
  assertEquals(response.headers.get("cache-control"), "no-store");
  assertEquals(response.headers.get("content-type"), "text/css; charset=utf-8");
  assertEquals(await response.text(), "generated contents");

  const notFound = await handler(new Request("http://127.0.0.1/unknown"));
  assertEquals(notFound.status, 404);
});

Deno.test("main serves a localized userstyle and shuts down", async () => {
  const portProbe = Deno.listen({ hostname: "127.0.0.1", port: 0 });
  const port = (portProbe.addr as Deno.NetAddr).port;
  portProbe.close();

  const stop = new AbortController();
  const running = main(["--port", port.toString(), "github"], stop.signal);
  const userstyleUrl =
    `http://127.0.0.1:${port}/styles/github/catppuccin.user.less`;

  try {
    let response: Response | undefined;
    for (let attempt = 0; attempt < 40; attempt++) {
      try {
        response = await fetch(userstyleUrl);
        break;
      } catch {
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
    }

    assertEquals(response?.status, 200);
    const contents = await response!.text();
    assertEquals(
      contents.includes(`http://127.0.0.1:${port}/lib/std/v1.less?v=`),
      true,
    );
    assertEquals(
      contents.includes(
        '@import "https://userstyles.catppuccin.com/lib/std/v1.less"',
      ),
      false,
    );

    const library = await fetch(`http://127.0.0.1:${port}/lib/lib.less`);
    assertEquals(library.status, 200);
    const libraryContents = await library.text();
    assertEquals(
      libraryContents.includes(`http://127.0.0.1:${port}/lib/std/v1.less?v=`),
      true,
    );
    const standardLibrary = await fetch(
      `http://127.0.0.1:${port}/lib/std/v1.less`,
    );
    assertEquals(standardLibrary.status, 200);
    await standardLibrary.text();
  } finally {
    stop.abort();
    await running;
  }
});

Deno.test("calculateLibChecksum tracks nested library changes and renames", async () => {
  const root = await Deno.makeTempDir();
  try {
    await Deno.mkdir(`${root}/std`);
    await Deno.writeTextFile(`${root}/std/v1.less`, "original");
    const original = await calculateLibChecksum(root);
    await Deno.writeTextFile(`${root}/std/v1.less`, "changed");
    const changed = await calculateLibChecksum(root);
    assertNotEquals(original, changed);
    await Deno.rename(`${root}/std/v1.less`, `${root}/std/v2.less`);
    assertNotEquals(changed, await calculateLibChecksum(root));
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("createRequestHandler localizes nested imports without stale cache headers", async () => {
  const root = await Deno.makeTempDir();
  try {
    await Deno.writeTextFile(
      `${root}/lib.less`,
      '@import "https://userstyles.catppuccin.com/lib/std/v1.less";',
    );
    let checksum = "abcdef123456";
    const handler = createRequestHandler({
      getUserstyleContents: () => "",
      libPath: root,
      userstyleRoute: "/styles/github/catppuccin.user.less",
      rewriteLibraryContents: (contents) =>
        rewriteLibraryImports(contents, "http://127.0.0.1:8123", checksum),
    });
    const url = "http://127.0.0.1:8123/lib/lib.less";
    const first = await handler(new Request(url));
    assertEquals(first.status, 200);
    assertEquals(
      await first.text(),
      '@import "http://127.0.0.1:8123/lib/std/v1.less?v=abcdef";',
    );
    checksum = "fedcba654321";
    const next = await handler(
      new Request(url, {
        headers: {
          "if-modified-since": "Wed, 31 Dec 2098 00:00:00 GMT",
          "if-none-match": "*",
          "range": "bytes=0-4",
        },
      }),
    );
    assertEquals(next.status, 200);
    assertEquals(next.headers.get("cache-control"), "no-store");
    assertEquals(next.headers.get("etag"), null);
    assertEquals(next.headers.get("last-modified"), null);
    assertEquals(next.headers.get("content-length"), null);
    assertEquals(
      await next.text(),
      '@import "http://127.0.0.1:8123/lib/std/v1.less?v=fedcba";',
    );
    const head = await handler(new Request(url, { method: "HEAD" }));
    assertEquals(head.status, 200);
    assertEquals(await head.text(), "");
    const missing = await handler(
      new Request("http://127.0.0.1:8123/lib/missing.less"),
    );
    assertEquals(missing.status, 404);
    await missing.text();
  } finally {
    await Deno.remove(root, { recursive: true });
  }
});

Deno.test("main reloads nested library and userstyle edits through HTTP imports", async () => {
  const styleDir = await Deno.makeTempDir({
    dir: path.join(REPO_ROOT, "styles"),
    prefix: "serve-test-",
  });
  const libDir = await Deno.makeTempDir({
    dir: path.join(REPO_ROOT, "lib"),
    prefix: "serve-test-",
  });
  const styleFile = path.join(styleDir, "catppuccin.user.less");
  const nestedDir = path.join(libDir, "std");
  const stop = new AbortController();
  let running: Promise<void> | undefined;
  try {
    await Deno.mkdir(nestedDir);
    const versionFile = path.join(nestedDir, "v1.less");
    await Deno.writeTextFile(versionFile, "@probe: #123456;");
    const libUrl = `https://userstyles.catppuccin.com/lib/${
      path.basename(libDir)
    }`;
    await Deno.writeTextFile(
      path.join(libDir, "shim.less"),
      `@import "${libUrl}/std/v1.less";`,
    );
    await Deno.writeTextFile(
      styleFile,
      `@import "${libUrl}/shim.less"; .probe { color: @probe; }`,
    );
    const portProbe = Deno.listen({ hostname: "127.0.0.1", port: 0 });
    const port = (portProbe.addr as Deno.NetAddr).port;
    portProbe.close();
    running = main(
      ["--port", String(port), path.basename(styleDir)],
      stop.signal,
    );
    const url = `http://127.0.0.1:${port}/styles/${
      path.basename(styleDir)
    }/catppuccin.user.less`;
    const waitForContents = async (
      accept: (contents: string) => boolean,
    ): Promise<string> => {
      for (let attempt = 0; attempt < 200; attempt++) {
        try {
          const response = await fetch(url);
          const contents = await response.text();
          if (response.ok && accept(contents)) return contents;
        } catch {
          // The server may still be starting.
        }
        await new Promise((resolve) => setTimeout(resolve, 25));
      }
      throw new Error("Timed out waiting for the development server to reload");
    };
    const initial = await waitForContents(() => true);
    assertEquals((await less.render(initial)).css.includes("#123456"), true);
    await Deno.writeTextFile(versionFile, "@probe: #654321;");
    const reloaded = await waitForContents((contents) => contents !== initial);
    assertEquals((await less.render(reloaded)).css.includes("#654321"), true);
    await Deno.writeTextFile(
      styleFile,
      `${await Deno.readTextFile(
        styleFile,
      )} .userstyle-edit { color: @probe; }`,
    );
    const edited = await waitForContents((contents) =>
      contents.includes(".userstyle-edit")
    );
    assertEquals(
      (await less.render(edited)).css.includes(".userstyle-edit"),
      true,
    );
  } finally {
    stop.abort();
    await running;
    await Deno.remove(styleDir, { recursive: true });
    await Deno.remove(libDir, { recursive: true });
  }
});
