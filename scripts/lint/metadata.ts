// @ts-types="@/types/usercss-meta.d.ts";
import usercssMeta from "usercss-meta";
import * as color from "@std/fmt/colors";
import { sprintf } from "@std/fmt/printf";
import type { WalkEntry } from "@std/fs";
import { join, relative } from "@std/path";

import { REPO_ROOT } from "@/deps.ts";
import { log } from "@/logger.ts";
import { formatListOfItems } from "@/utils.ts";
import type { Userstyles } from "@/types/userstyles.d.ts";

export const verifyMetadata = async (
  entry: WalkEntry,
  content: string,
  userstyle: string,
  userstyles: Userstyles,
  fix: boolean,
) => {
  // `usercss-meta` prohibits any '\r' characters, which seem to be present on Windows.
  content = content.replaceAll("\r\n", "\n");

  const assert = assertions(userstyle, userstyles);
  const file = relative(REPO_ROOT, entry.path);

  const { metadata, errors: parsingErrors } = usercssMeta.parse(content, {
    allowErrors: true,
  });
  const lines = content.split("\n");

  // Pretty print / annotate the parsing errors.
  parsingErrors.map((e) => {
    let startLine;
    if (e.index !== undefined && !Number.isNaN(e.index)) {
      startLine = 0;
      for (const line of lines) {
        startLine++;
        e.index -= line.length + 1;
        if (e.index < 0) break;
      }
    }

    // Skip "missing mandatory metadata property" ParseError, assertions checks below will cover.
    if (e.code === "missingMandatory") return;

    log.error(e.message, {
      file,
      startLine,
      content,
    });
  });

  for (const [key, expected] of Object.entries(assert)) {
    const current = metadata[key];

    const atKey = "@" + key;

    if (current !== expected) {
      const line = lines
        .findIndex((line) => line.includes(`${atKey} `)) + 1;

      const message = current === undefined
        ? sprintf(
          "UserCSS metadata property `%s` is undefined",
          color.bold(atKey),
        )
        : sprintf(
          'UserCSS metadata property `%s` should be "%s" but is "%s"',
          color.bold(atKey),
          color.green(expected),
          color.red(String(current)),
        );

      log.error(message, {
        file,
        startLine: line !== 0 ? line : undefined,
        content,
      });
    }
  }

  const template = (await Deno.readTextFile(
    join(REPO_ROOT, "template/catppuccin.user.css"),
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

      log.error(
        sprintf(
          "Metadata variable `%s` should exist",
          color.bold(variable),
        ),
        {
          file,
          startLine: line !== 0 ? line : undefined,
          content,
        },
      );
    } else if (expected.trim() !== lines[current - 1].trim()) {
      const message = sprintf(
        "Options for metadata variable `%s` should be `%s`",
        color.bold(variable),
        (/\[[^\]]+\]/.exec(expected) as RegExpExecArray)[0],
      );

      log.error(message, {
        file,
        startLine: current,
        content,
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
  const globalVars = Object.entries(metadata.vars)
    .reduce((acc, [k, v]) => {
      return { ...acc, [k]: v.default };
    }, {});

  return {
    globalVars,
    isLess: metadata.preprocessor === assert.preprocessor,
    fixed: content,
  };
};

const assertions = (userstyle: string, userstyles: Userstyles) => {
  const prefix = "https://github.com/catppuccin/userstyles";

  if (!userstyles[userstyle]) {
    log.error(
      `Metadata section for \`${color.bold(userstyle)}\` userstyle is missing`,
      {
        file: "scripts/userstyles.yml",
      },
    );
    Deno.exit(1);
  }

  return {
    name: `${
      Array.isArray(userstyles[userstyle].name)
        ? (userstyles[userstyle].name as string[]).join("/")
        : userstyles[userstyle].name
    } Catppuccin`,
    namespace: `github.com/catppuccin/userstyles/styles/${userstyle}`,
    homepageURL: `${prefix}/tree/main/styles/${userstyle}`,
    description: `Soothing pastel theme for ${
      Array.isArray(userstyles[userstyle].name)
        ? formatListOfItems(userstyles[userstyle].name as string[])
        : userstyles[userstyle].name
    }`,
    author: "Catppuccin",
    updateURL: `${prefix}/raw/main/styles/${userstyle}/catppuccin.user.css`,
    supportURL: `${prefix}/issues?q=is%3Aopen+is%3Aissue+label%3A${userstyle}`,
    license: "MIT",
    preprocessor: "less",
  };
};
