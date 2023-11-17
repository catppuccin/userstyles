import { deepMerge } from "std/collections/mod.ts";

import stylelint from "npm:stylelint";
import stylelintConfigStandard from "npm:stylelint-config-standard";
import stylelintConfigRecommended from "npm:stylelint-config-recommended";
import postcssLess from "npm:postcss-less";

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
    "length-zero-no-unit": null,

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
  },
};

const base = deepMerge(
  stylelintConfigRecommended,
  { ...stylelintConfigStandard, extends: {} },
);

export const lint = (files: string, fix: boolean) =>
  stylelint.lint({
    config: deepMerge(base, config),
    files,
    fix,
  });
