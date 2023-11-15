import stylelint from "npm:stylelint";
import stylelintConfigStandard from "npm:stylelint-config-standard";
import stylelintConfigRecommended from "npm:stylelint-config-recommended";
import postcssLess from "npm:postcss-less";

const config = {
  ...stylelintConfigRecommended,
  ...{ ...stylelintConfigStandard, extends: {} },
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

    "function-no-unknown": [
      true,
      {
        ignoreFunctions: [
          "if",
          "boolean",
          "escape",
          "e",
          "%",
          "replace",
          "length",
          "extract",
          "range",
          "each",
          "ceil",
          "floor",
          "percentage",
          "round",
          "sqrt",
          "abs",
          "sin",
          "asin",
          "cos",
          "acos",
          "tan",
          "atan",
          "pi",
          "pow",
          "mod",
          "min",
          "max",
          "isnumber",
          "isstring",
          "iscolor",
          "iskeyword",
          "isurl",
          "ispixel",
          "isem",
          "ispercentage",
          "isunit",
          "isruleset",
          "isdefined",
          "color",
          "image-size",
          "image-width",
          "image-height",
          "convert",
          "data-uri",
          "default",
          "unit",
          "get-unit",
          "svg-gradient",
          "rgb",
          "rgba",
          "argb",
          "hsl",
          "hsla",
          "hsv",
          "hsva",
          "hue",
          "saturation",
          "lightness",
          "hsvhue",
          "hsvsaturation",
          "hsvvalue",
          "red",
          "green",
          "blue",
          "alpha",
          "luma",
          "luminance",
          "saturate",
          "desaturate",
          "lighten",
          "darken",
          "fadein",
          "fadeout",
          "fade",
          "spin",
          "mix",
          "tint",
          "shade",
          "greyscale",
          "contrast",
          "multiply",
          "screen",
          "overlay",
          "softlight",
          "hardlight",
          "difference",
          "exclusion",
          "average",
          "negation",
        ],
      },
    ],
    "function-name-case": null,
    "no-descending-specificity": null,
  },
};

export const lint = (code: string) => stylelint.lint({ config, code });
