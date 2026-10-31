import { test } from "node:test";

import { REPO_ROOT } from "../constants.ts";

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

const serializers = [(value: unknown) => String(value)];

test("#lib.rgbify", async (t) => {
  t.assert.snapshot(
    await compile(`
.foo {
  --bar: #lib.rgbify(red)[];
}
`),
    { serializers },
  );
});

test("#lib.hslify", async (t) => {
  t.assert.snapshot(
    await compile(`
.foo {
  --bar: #lib.hslify(red)[];
}
`),
    { serializers },
  );
});
