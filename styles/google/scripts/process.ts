import { type CssColor, type CustomAtRules, type Declaration, type ReturnedDeclaration, type ReturnedRule, type RGBColor, TokenOrValue, transform, Variable, type Visitor } from "lightningcss";
import { Buffer } from "node:buffer";

import Color from 'color';
import { colorIndex } from "./color-index.ts";

// Why is this exposed in Rust but not TS? >.>
function lightningCssCssColorToRgb(color: CssColor): RGBColor | undefined {
  // This is a SystemColor, don't touch it
  if (typeof (color) === "string") return;

  switch (color.type) {
    case "currentcolor":
      break;

    case "rgb":
      return color;

    case "hsl": {
      const rgb = Color.hsl(color.h, color.s, color.l, color.alpha).rgb();
      return {
        r: rgb.red(),
        g: rgb.green(),
        b: rgb.blue(),
        alpha: rgb.alpha(),
        type: "rgb"
      };
    }

    default:
      break;
  }
}

const visitor: Visitor<CustomAtRules> = {
  Declaration(declaration: Declaration): void | ReturnedDeclaration | ReturnedDeclaration[] {
    const rgb = lightningCssCssColorToRgb(declaration.value as CssColor)
    if (rgb) {
      if (!rgb) return;
      const index = colorIndex[`rgb(${rgb.r} ${rgb.g} ${rgb.b} / ${rgb.alpha})`]
      if (!index) return
      return {
        property: declaration.property,
        raw: index
      } as ReturnedDeclaration
    }
  },
  Rule(rule): ReturnedRule | ReturnedRule[] | void {
    if (rule.type === 'keyframes' || rule.type === 'font-face' || rule.type === 'container') {
      return []
    }
  }
};

export function processCSS(css: string) {
  const cleanedCss = css.replace(/@import\s+[^;]+;/g, "");
  const main = transform({
    filename: "",
    minify: false,
    sourceMap: false,
    code: Buffer.from(cleanedCss),
    visitor,

    // Google's code is a technically working
    // but best practices train wreck once compiled
    errorRecovery: true,
  });
  return main.code
}
