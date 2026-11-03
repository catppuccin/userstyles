import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { stripVTControlCharacters } from "node:util";

import { STYLES_ROOT } from "#/constants.ts";
import { checkLess } from "#/lint/less.ts";
import { checkMetadata } from "#/lint/metadata.ts";
import { checkRepository } from "#/lint/repository.ts";
import { checkStylelint } from "#/lint/stylelint.ts";
import { loadUserstylesData } from "#/utils/data.ts";
import stylelintConfig from "../../.stylelintrc.js";

const { data } = loadUserstylesData();
assert(data);
const { userstyles } = data;

const file = "styles/github/catppuccin.user.less";
const github = readFileSync(
  path.join(STYLES_ROOT, "github/catppuccin.user.less"),
  "utf8",
);

describe("checkMetadata", () => {
  test("valid userstyle", async () => {
    const result = await checkMetadata(
      file,
      github,
      "github",
      userstyles,
      false,
    );
    assert.deepEqual(result.diagnostics, []);
    assert.equal(result.content, github);
    assert.equal(result.isLess, true);
  });

  test("fixes incorrect properties", async () => {
    const content = github.replace(/@name\s+.*/, "@name GitHu Catpucin");
    const result = await checkMetadata(
      file,
      content,
      "github",
      userstyles,
      true,
    );
    assert.equal(result.diagnostics.length, 1);
    assert.equal(result.diagnostics[0].span?.line.start, 2);
    assert.equal(result.content, github);
  });

  test("userstyle missing from userstyles.yml", async () => {
    const result = await checkMetadata(file, github, "nope", userstyles, false);
    assert.equal(result.diagnostics.length, 1);
    assert.equal(result.diagnostics[0].file, "scripts/userstyles.yml");
    assert.equal(result.isLess, false);
  });
});

describe("checkStylelint", () => {
  test("keeps fixes when unfixable problems remain", async () => {
    const result = await checkStylelint(
      file,
      ".a {\n  & .b {\n    colr: red;\n  }\n}\n",
      true,
      stylelintConfig,
    );
    assert.equal(result.content, ".a {\n  .b {\n    colr: red;\n  }\n}\n");
    assert.deepEqual(
      result.diagnostics.map((
        { message, span },
      ) => [stripVTControlCharacters(message), span?.line.start]),
      [['Unexpected unknown property "colr" (property-no-unknown).', 3]],
    );
  });
});

describe("checkLess", () => {
  test("reports compile errors", async () => {
    const diagnostics = await checkLess(file, ".a {\n  color: @nope;\n}\n", {});
    assert.equal(diagnostics.length, 1);
    assert.equal(
      stripVTControlCharacters(diagnostics[0].message),
      "variable @nope is undefined",
    );
    assert.equal(diagnostics[0].span?.line.start, 2);
  });
});

describe("checkRepository", () => {
  test("userstyle without a directory", () => {
    assert.deepEqual(checkRepository(userstyles), []);

    const diagnostics = checkRepository({
      ...userstyles,
      nope: userstyles.github,
    });
    assert.equal(diagnostics.length, 1);
    assert.match(
      stripVTControlCharacters(diagnostics[0].message),
      /`nope` has no `styles\/nope` directory/,
    );
  });
});
