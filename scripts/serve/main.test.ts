import { assertEquals, assertNotEquals, assertThrows } from "@std/assert";

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
      contents.includes(`http://127.0.0.1:${port}/lib/lib.less?v=`),
      true,
    );
    assertEquals(
      contents.includes(
        '@import "https://userstyles.catppuccin.com/lib/lib.less"',
      ),
      false,
    );

    const library = await fetch(`http://127.0.0.1:${port}/lib/lib.less`);
    assertEquals(library.status, 200);
    await library.text();
  } finally {
    stop.abort();
    await running;
  }
});
