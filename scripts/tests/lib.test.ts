import { assertSnapshot } from "@std/testing/snapshot";

import { REPO_ROOT } from "../constants.ts";

// @ts-types="npm:@types/less";
import less from "less";

async function compile(source: string) {
  const result = await less.render(
    `
@import "lib/lib.less";

${source}
`,
    { paths: [REPO_ROOT] },
  );
  return result.css;
}

Deno.test("#lib.rgbify", async (ctx) => {
  await assertSnapshot(
    ctx,
    await compile(`
.foo {
  --bar: #lib.rgbify(red)[];
}
`),
  );
});

Deno.test("#lib.hslify", async (ctx) => {
  await assertSnapshot(
    ctx,
    await compile(`
.foo {
  --bar: #lib.hslify(red)[];
}
`),
  );
});
