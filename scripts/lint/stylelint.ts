import { deepMerge } from "std/collections/deep_merge.ts";

import * as color from "std/fmt/colors.ts";
import stylelint from "npm:stylelint";
import stylelintConfigStandard from "npm:stylelint-config-standard";
import stylelintConfigRecommended from "npm:stylelint-config-recommended";
import postcssLess from "npm:postcss-less";

import { log } from "./logger.ts";
import { relative } from "https://deno.land/std@0.150.0/path/mod.ts";
import { REPO_ROOT } from "@/deps.ts";
import { WalkEntry } from "std/fs/walk.ts";

const config: stylelint.Config = {
  customSyntax: postcssLess,
  rules: {
    "selector-class-pattern": null,
    "custom-property-pattern": null,
    "selector-id-pattern": null,

    "rule-empty-line-before": null,
    "comment-empty-line-before": null,
    "custom-property-empty-line-before": null,
    "at-rule-empty-line-before": null,
    "declaration-empty-line-before": null,

    "property-no-vendor-prefix": null,
    "alpha-value-notation": null,
    "color-function-notation": null,
    "hue-degree-notation": null,

    // less doesn't care about these
    "no-invalid-position-at-import-rule": null,
    "no-invalid-double-slash-comments": null,

    "at-rule-disallowed-list": [[
      "/^font.*/",
    ], {
      message: (atRule: string) =>
        `At-rule ${atRule} is not allowed in Catppuccin userstyles`,
    }],
    "property-disallowed-list": [[
      // disallow setting fonts
      "/font.*/",

      // ideally we could disallow these, but CSS continues to be gross
      // "/animation.*/",
      // "/transition.*/",

      // prefer `border-color` over `border`, `outline-color` over `outline`, etc.
      "border",
      "outline",
    ], {
      message: (prop: string) => {
        if (["border", "outline"].includes(prop)) {
          return `Use \`${prop}-color\` instead of \`${prop}\``;
        } else {
          return `Property \`${prop}\` is not allowed in Catppuccin userstyles`;
        }
      },
    }],

    "function-no-unknown": [
      true,
      {
        ignoreFunctions: [
          // generated from https://lesscss.org/functions/
          // via `Array.from(document.querySelectorAll('.section-content h3.docs-heading'), heading => heading.textContent.replace('\n', ''))`
          "%",
          "abs",
          "acos",
          "alpha",
          "argb",
          "asin",
          "atan",
          "average",
          "blue",
          "boolean",
          "ceil",
          "color",
          "contrast",
          "convert",
          "cos",
          "darken",
          "data-uri",
          "default",
          "desaturate",
          "difference",
          "e",
          "each",
          "escape",
          "exclusion",
          "extract",
          "fade",
          "fadein",
          "fadeout",
          "floor",
          "get-unit",
          "green",
          "greyscale",
          "hardlight",
          "hsl",
          "hsla",
          "hsv",
          "hsva",
          "hsvhue",
          "hsvsaturation",
          "hsvvalue",
          "hue",
          "if",
          "image-height",
          "image-size",
          "image-width",
          "iscolor",
          "isdefined",
          "isem",
          "iskeyword",
          "isnumber",
          "ispercentage",
          "ispixel",
          "isruleset",
          "isstring",
          "isunit",
          "isurl",
          "length",
          "lighten",
          "lightness",
          "luma",
          "luminance",
          "max",
          "min",
          "mix",
          "mod",
          "multiply",
          "negation",
          "overlay",
          "percentage",
          "pi",
          "pow",
          "range",
          "red",
          "replace",
          "rgb",
          "rgba",
          "round",
          "saturate",
          "saturation",
          "screen",
          "shade",
          "sin",
          "softlight",
          "spin",
          "sqrt",
          "svg-gradient",
          "tan",
          "tint",
          "unit",
        ],
      },
    ],
    "function-name-case": null,
    "no-descending-specificity": null,

    "media-feature-range-notation": "prefix",
  },
};

const base = deepMerge(
  stylelintConfigRecommended,
  { ...stylelintConfigStandard, extends: {} },
);

export const lint = (entry: WalkEntry, content: string, fix: boolean) => {
  const file = relative(REPO_ROOT, entry.path);

  stylelint.lint({
    config: deepMerge(base, config),
    files: entry.path,
    fix,
  })
    .then(({ results }) => {
      results.map((result) => {
        result.warnings.map((warning) => {
          // some cleanup for fancier logging, dims the rule name
          const message = warning.text?.replace(
            new RegExp(`\\(?${warning.rule}\\)?`),
            color.dim(`(${warning.rule})`),
          ) ?? "unspecified stylelint error";

          log(message, {
            file,
            startLine: warning.line,
            endLine: warning.endLine,
            startColumn: warning.column,
            endColumn: warning.endColumn,
            content,
          }, warning.severity);
        });
      });
    });
};
