import type { Userstyle, Userstyles } from "#/types/userstyles.d.ts";
import { REPO_ROOT } from "#/constants.ts";

import { readFile } from "node:fs/promises";

import path from "node:path";

import usercssMeta from "usercss-meta";
import type { Diagnostic } from "#/utils/diagnostics.ts";
import { formatListOfItems } from "#/utils/format.ts";
import { style } from "#/utils/style.ts";
import { USERSTYLES_FILE } from "../utils/data.ts";

/**
 * Check the UserCSS metadata of a userstyle against its definition in `userstyles.yml` and the template metadata section.
 * `content` must use `\n` line endings, as `usercss-meta` prohibits any '\r' characters.
 */
export async function checkMetadata(
  file: string,
  content: string,
  userstyle: string,
  userstyles: Userstyles,
  fix: boolean,
): Promise<{
  diagnostics: Diagnostic[];
  content: string;
  globalVars: Record<string, string>;
  isLess: boolean;
}> {
  const diagnostics: Diagnostic[] = [];

  const metadata = userstyles[userstyle];
  if (!metadata) {
    diagnostics.push({
      file: USERSTYLES_FILE,
      severity: "error",
      message: `Metadata section for \`${
        style.bold(userstyle)
      }\` userstyle is missing.`,
    });
    return { diagnostics, content, globalVars: {}, isLess: false };
  }
  const assertions = generateUserCSSAssertions(userstyle, metadata);

  const { metadata: userCss, errors: parsingErrors } = usercssMeta.parse(
    content,
    {
      allowErrors: true,
    },
  );
  const lines = content.split("\n");

  // Pretty print / annotate the parsing errors.
  for (const error of parsingErrors) {
    let startLine;
    if (error.index !== undefined && !Number.isNaN(error.index)) {
      startLine = 0;
      for (const line of lines) {
        startLine++;
        error.index -= line.length + 1;
        if (error.index < 0) break;
      }
    }

    // Skip "missing mandatory metadata property" ParseError, assertions checks below will cover.
    if (error.code === "missingMandatory") continue;

    diagnostics.push({
      severity: "error",
      message: error.message,
      file,
      span: startLine !== undefined
        ? { line: { start: startLine } }
        : undefined,
      content,
    });
  }

  for (const [key, expected] of Object.entries(assertions)) {
    const current = userCss[key];

    const atKey = "@" + key;

    if (current !== expected) {
      const line = lines
        .findIndex((line) => line.includes(`${atKey} `)) + 1;

      const message = current === undefined
        ? `UserCSS metadata property \`${style.bold(atKey)}\` is undefined.`
        : `UserCSS metadata property \`${style.bold(atKey)}\` should be "${
          style.green(expected)
        }" but is "${style.red(String(current))}".`;

      // Only fixable if the current value is on the same line as the property.
      const fixable = current !== undefined &&
        content.includes(`${atKey} ${current}`);

      diagnostics.push({
        severity: "error",
        message,
        file,
        span: line !== 0 ? { line: { start: line } } : undefined,
        content,
        fixable,
      });

      if (fix && fixable) {
        content = content.replace(
          `${atKey} ${current}`,
          `${atKey} ${expected}`,
        );
      }
    }
  }

  const template = (await readFile(
    path.join(REPO_ROOT, "template/catppuccin.user.less"),
    "utf8",
  ))
    .split("\n");

  for (const variable of ["darkFlavor", "lightFlavor", "accentColor"]) {
    const declaration = `@var select ${variable}`;

    const expected = template.find((line) => line.includes(declaration))!;
    const current = lines.findIndex((line) => line.includes(declaration)) +
      1;

    if (current === 0) {
      // This variable is undefined so there isn't a line for it, so we just put it at the bottom of the variables section.
      const line = lines
        .findLastIndex((line: string) => line.includes("==/UserStyle== */")) +
        1;

      diagnostics.push({
        severity: "error",
        message: `Metadata variable \`${style.bold(variable)}\` should exist.`,
        file,
        span: line !== 0 ? { line: { start: line } } : undefined,
        content,
      });
    } else if (expected.trim() !== lines[current - 1].trim()) {
      const message = `Options for metadata variable \`${
        style.bold(variable)
      }\` should be \`${
        (/\[[^\]]+\]/.exec(expected) as RegExpExecArray)[0]
      }\`.`;

      diagnostics.push({
        severity: "error",
        message,
        file,
        span: { line: { start: current } },
        content,
        fixable: true,
      });

      if (fix) {
        content = content.replace(lines[current - 1], expected);
      }
    }
  }

  // Parse the UserCSS variables to LESS global variables, e.g.
  // `@var select lightFlavor "Light Flavor" ["latte:Latte*", "frappe:Frappé", "macchiato:Macchiato", "mocha:Mocha"]`
  // gets parsed as
  // `lightFlavor: "latte"`.
  const globalVars: Record<string, string> = Object.entries(userCss.vars)
    .reduce((acc, [k, v]) => {
      return { ...acc, [k]: v.default };
    }, {});

  return {
    diagnostics,
    content,
    globalVars,
    isLess: userCss.preprocessor === assertions.preprocessor,
  };
}

function generateUserCSSAssertions(userstyle: string, metadata: Userstyle) {
  const prefix = "https://github.com/catppuccin/userstyles";

  return {
    name: `${
      [
        metadata.name,
        ...Object.values(metadata.supports ?? {}).map(({ name }) => name),
      ].join("/")
    } Catppuccin`,
    namespace: `github.com/catppuccin/userstyles/styles/${userstyle}`,
    homepageURL: `${prefix}/tree/main/styles/${userstyle}`,
    description: `Soothing pastel theme for ${
      formatListOfItems([
        metadata.name,
        ...Object.values(metadata.supports ?? {}).map(({ name }) => name),
      ])
    }`,
    author: "Catppuccin",
    updateURL: `${prefix}/raw/main/styles/${userstyle}/catppuccin.user.less`,
    supportURL: `${prefix}/issues?q=is%3Aopen+is%3Aissue+label%3A${userstyle}`,
    license: "MIT",
    preprocessor: "less",
  };
}
