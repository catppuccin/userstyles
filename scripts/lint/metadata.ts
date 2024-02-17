// @deno-types="@/types/usercss-meta.d.ts";
import usercssMeta from "usercss-meta";
import * as color from "std/fmt/colors.ts";
import { sprintf } from "std/fmt/printf.ts";
import type { WalkEntry } from "std/fs/walk.ts";
import { relative } from "std/path/mod.ts";

import { REPO_ROOT } from "@/deps.ts";
import { log } from "@/lint/logger.ts";
import { formatListOfItems, getUserstylesData } from "@/utils.ts";

export const verifyMetadata = async (
  entry: WalkEntry,
  content: string,
  userstyle: string,
) => {
  const assert = await assertions(userstyle);
  const file = relative(REPO_ROOT, entry.path);

  const { metadata, errors: parsingErrors } = usercssMeta.parse(content, {
    allowErrors: true,
  });

  // Pretty print / annotate the parsing errors.
  parsingErrors.map((e) => {
    let startLine = 0;
    for (const line of content.split("\n")) {
      startLine++;
      e.index -= line.length + 1;
      if (e.index < 0) break;
    }
    log(e.message, { file, startLine, content });
  });

  for (const [key, expected] of Object.entries(assert)) {
    const current = metadata[key];

    if (current !== expected) {
      const line = content
        .split("\n")
        .findIndex((line) => line.includes(key)) + 1;

      const message = current === undefined
        ? sprintf("Metadata `%s` should not be undefined", color.bold(key))
        : sprintf(
          'Metadata `%s` should be "%s" but is "%s"',
          color.bold(key),
          color.green(expected),
          color.red(String(current)),
        );

      log(message, {
        file,
        startLine: line !== 0 ? line : undefined,
        content,
      }, "warning");
    }
  }

  for (const [variable, expected] of Object.entries(vars)) {
    const current = metadata
      .vars[variable as keyof typeof metadata["vars"]] as typeof vars[
        keyof typeof vars
      ];

    if (current === undefined) {
      // This variable is undefined so there isn't a line for it, so we just put it at the bottom of the variables section.
      const line = content
        .split("\n")
        .findLastIndex((line: string) => line.includes("==/UserStyle== */")) +
        1;

      log(
        sprintf(
          "Metadata variable `%s` should exist",
          color.bold(variable),
        ),
        {
          file,
          startLine: line !== 0 ? line : undefined,
          content,
        },
        "warning",
      );
    } else {
      // If this property is an array (such as `options`) and there is a difference in the stringified representation of the values...
      const line = content.split("\n")
        .findIndex((line: string) => line.includes(`@var select ${variable}`)) +
        1;

      if (JSON.stringify(current) !== JSON.stringify(expected)) {
        const errors = [];
        for (const [property, value] of Object.entries(expected)) {
          if (current[property] !== value) {
            if (Array.isArray(value) && Array.isArray(current[property])) {
              for (const option of value) {
                const currentOption = current[property as "options"].find((o) =>
                  o.name === option.name || o.label === option.label
                );
                if (!currentOption) {
                  errors.push(
                    sprintf(
                      "option `%s` should exist",
                      color.bold(option.name),
                      color.bold(variable),
                    ),
                  );
                } else {
                  for (const [k, v] of Object.entries(option)) {
                    if (v === currentOption[k]) continue;
                    errors.push(
                      sprintf(
                        '%s of option `%s` should be "%s" but is "%s"',
                        k,
                        color.bold(option.name),
                        color.green(v),
                        color.red(currentOption[k]),
                      ),
                    );
                  }
                }
              }
            } else {
              errors.push(
                sprintf(
                  '%s should be "%s" but is "%s"',
                  property,
                  color.green(value as string),
                  color.red(current[property] as string),
                ),
              );
            }
          }
        }
        const message =
          sprintf("Metadata variable `%s`: ", color.bold(variable)) +
          errors.join(" and ");

        log(message, {
          file,
          startLine: line !== 0 ? line : undefined,
          content,
        }, "warning");
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
  };
};

const assertions = async (userstyle: string) => {
  const prefix = "https://github.com/catppuccin/userstyles";

  const { userstyles } = await getUserstylesData().catch((err) => {
    console.error(err);
    Deno.exit(1);
  });

  if (!userstyles[userstyle]) {
    log("Metadata section for this userstyle has not been added", {
      file: "scripts/userstyles.yml",
    }, "error");
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

const vars = {
  lightFlavor: {
    type: "select",
    label: "Light Flavor",
    name: "lightFlavor",
    value: null,
    default: "latte",
    options: [
      { name: "latte", label: "Latte", value: "latte" },
      { name: "frappe", label: "Frappé", value: "frappe" },
      { name: "macchiato", label: "Macchiato", value: "macchiato" },
      { name: "mocha", label: "Mocha", value: "mocha" },
    ],
  },
  darkFlavor: {
    type: "select",
    label: "Dark Flavor",
    name: "darkFlavor",
    value: null,
    default: "mocha",
    options: [
      { name: "latte", label: "Latte", value: "latte" },
      { name: "frappe", label: "Frappé", value: "frappe" },
      { name: "macchiato", label: "Macchiato", value: "macchiato" },
      { name: "mocha", label: "Mocha", value: "mocha" },
    ],
  },
  accentColor: {
    type: "select",
    label: "Accent",
    name: "accentColor",
    value: null,
    default: "sapphire",
    options: [
      { name: "rosewater", label: "Rosewater", value: "rosewater" },
      { name: "flamingo", label: "Flamingo", value: "flamingo" },
      { name: "pink", label: "Pink", value: "pink" },
      { name: "mauve", label: "Mauve", value: "mauve" },
      { name: "red", label: "Red", value: "red" },
      { name: "maroon", label: "Maroon", value: "maroon" },
      { name: "peach", label: "Peach", value: "peach" },
      { name: "yellow", label: "Yellow", value: "yellow" },
      { name: "green", label: "Green", value: "green" },
      { name: "teal", label: "Teal", value: "teal" },
      { name: "blue", label: "Blue", value: "blue" },
      { name: "sapphire", label: "Sapphire", value: "sapphire" },
      { name: "sky", label: "Sky", value: "sky" },
      { name: "lavender", label: "Lavender", value: "lavender" },
      { name: "subtext0", label: "Gray", value: "subtext0" },
    ],
  },
} as Record<string, {
  type: string;
  label: string;
  name: string;
  value: null | string;
  default: string;
  options: { name: string; label: string; value: string }[];
}>;
