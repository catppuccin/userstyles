import { assertSnapshot } from "jsr:@std/testing/snapshot";
import { REPO_ROOT } from "../constants.ts";
// @ts-types="npm:@types/less";
import less from "less";

Deno.test("#lib.rgbify", async (ctx) => {
  await assertSnapshot(
    ctx,
    await less.render(
      `
@import "${REPO_ROOT}/lib/lib.less";

.foo {
  --bar: #lib.rgbify(@red);
}
`,
      { lint: true },
    ),
  );
});
