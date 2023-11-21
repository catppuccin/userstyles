import { deepMerge } from "std/collections/deep_merge.ts";
import * as color from "std/fmt/colors.ts";
import { exists, WalkEntry } from "std/fs/mod.ts";
import { dirname, relative } from "std/path/mod.ts";

import postcssLess from "npm:postcss-less";
import stylelint from "npm:stylelint";
import stylelintConfigStandard from "npm:stylelint-config-standard";
import stylelintConfigRecommended from "npm:stylelint-config-recommended";

import { REPO_ROOT } from "@/deps.ts";
import { log } from "@/lint/logger.ts";

const baseConfig: stylelint.Config = {
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

    // needed for Stylus v1.5.35 workaround, see #341
    "media-feature-range-notation": "prefix",

    // These are not invalid with Less.
    "no-invalid-position-at-import-rule": null,
    "no-invalid-double-slash-comments": null,

    "at-rule-disallowed-list": [[
      "/^font.*/",
    ], {
      message: (atRule: string) =>
        `At-rule ${atRule} is not allowed in Catppuccin userstyles`,
    }],
    "property-disallowed-list": [[
      // Disallow setting custom fonts.
      "/font.*/",

      // Ideally we could disallow these, but CSS continues to be gross.
      // "/animation.*/",
      // "/transition.*/",

      // Prefer `border-color` over `border`, `outline-color` over `outline`, etc.
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
          // Generated from https://lesscss.org/functions/ via `Array.from(document.querySelectorAll('.section-content h3.docs-heading'), heading => heading.textContent.replace('\n', ''))`.
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
  },
};

const stylelintCfg = deepMerge(
  stylelintConfigRecommended,
  { ...stylelintConfigStandard, extends: {} },
);
const config = deepMerge(stylelintCfg, baseConfig);

export const lint = async (entry: WalkEntry, content: string, fix: boolean) => {
  const file = relative(REPO_ROOT, entry.path);
  let styleCfg = config;

  // merge with a style specific config if it exists
  const styleCfgPath = dirname(entry.path) + "/.stylelintrc.json";
  if (await exists(styleCfgPath, { isFile: true, isReadable: true })) {
    const localCfg = JSON.parse(await Deno.readTextFile(styleCfgPath));
    styleCfg = deepMerge(styleCfg, localCfg, {
      arrays: "replace",
    });
  }

  stylelint.lint({
    config: styleCfg,
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
