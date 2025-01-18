// @ts-check

import stylelint from "stylelint";
import valueParser from "postcss-value-parser";
import { flavors } from "@catppuccin/palette";

const LESS_COLOR_OP_FUNCTIONS = [
  "saturate",
  "desaturate",
  "lighten",
  "darken",
  "fadein",
  "fadeout",
  "fade",
  "mix",
  "tint",
  "shade",
];
const NUMERICAL_VALUE_REGEX = /^[\d.]+$/;
const VALID_COLOR_VARIABLES = [
  ...Object.keys(flavors.latte.colors).map((color) => "@" + color),
  "@accent",
];

/**
 * Accepts a color operation amount and normalizes it by multiplying it by 100 if it is less than 1.
 * @param {string} amount
 * @returns {number}
 *
 * @example
 * normalizeColorOperationAmount("0.3") // 30
 * normalizeColorOperationAmount("30") // 30
 */
function normalizeColorOperationAmount(amount) {
  let value = Number.parseFloat(amount);
  if (value < 1) value *= 100;
  return value;
}

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = "catppuccin/color-operations";

const meta = {
  fixable: true,
};

const messages = ruleMessages(ruleName, {
  amount_not_percentage: () => `Function amount argument must be percentage`,
  rgba_used_with_variable: () => `Use 'fade' instead of 'rgba' on variables`,
  fadeout_used: () => `Use 'fade' instead of 'fadeout'`,
  fadein_used: () => `Use 'fade' instead of 'fadein'`,
});

/** @type {import('npm:stylelint').Rule} */
const ruleFunction = (primary, _secondary, context) => {
  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, {
      actual: primary,
      possible: [true],
    });

    if (!validOptions) return;

    root.walkDecls((decl) => {
      const parsed = valueParser(decl.value);

      parsed.walk((node) => {
        if (node.type !== "function") return;

        const pre = decl.prop.length +
          (decl.raws.between?.length || 0);
        const startIndex = pre + node.sourceIndex;
        const endIndex = pre + node.sourceEndIndex - 1;

        // Prevent using `rgba` with variables to change the alpha value.
        if (
          node.value === "rgba" &&
          node.nodes.length === 3 &&
          node.nodes[0].value.startsWith("@") &&
          NUMERICAL_VALUE_REGEX.test(node.nodes[2].value)
        ) {
          if (context.fix) {
            node.value = "fade";
            node.nodes[2].value = normalizeColorOperationAmount(
              node.nodes[2].value,
            ) + "%";
          } else {
            report({
              result,
              ruleName,
              message: messages.rgba_used_with_variable(),
              node: decl,
              index: startIndex,
              endIndex: endIndex,
            });
          }
        }

        // Use `fade` instead of `fadeout`.
        if (
          node.value === "fadeout"
        ) {
          if (
            context.fix &&
            // Only autofixable if it follows the pattern of `fadeout(@<color>, <num>%)`. Otherwise, it's ambiguous.
            node.nodes.length === 3 &&
            VALID_COLOR_VARIABLES.includes(node.nodes[0].value)
          ) {
            node.value = "fade";
            const value = node.nodes[2].value.replace("%", "");
            // Invert the value to get the fade amount. E.g. `fadeout(@color, 30%)` becomes `fade(@color, 70%)`.
            node.nodes[2].value = (100 - normalizeColorOperationAmount(value)) +
              "%";
          } else {
            report({
              result,
              ruleName,
              message: messages.fadeout_used(),
              node: decl,
              index: startIndex,
              endIndex: endIndex,
            });
          }
        }

        // Use `fade` instead of `fadein`. Not autofixable because a) on palette variables, it has no effect (increasing opaqueness on a fully opaque color) and b) it's ambiguous otherwise.
        if (node.value === "fadein") {
          report({
            result,
            ruleName,
            message: messages.fadein_used(),
            node: decl,
            index: startIndex,
            endIndex: endIndex,
          });
        }

        // Use percentage amount values for Less color operation functions.

        if (!LESS_COLOR_OP_FUNCTIONS.includes(node.value)) return;

        const amountArgIndex = node.value === "mix" ? 4 : 2;

        if (
          node.nodes.length === amountArgIndex + 1 &&
          !node.nodes[amountArgIndex].value.endsWith("%")
        ) {
          const value = node.nodes[amountArgIndex].value;
          if (!NUMERICAL_VALUE_REGEX.test(value)) return;

          if (context.fix) {
            node.nodes[amountArgIndex].value = normalizeColorOperationAmount(
              value,
            ) + "%";
          } else {
            report({
              result,
              ruleName,
              message: messages.amount_not_percentage(),
              node: decl,
              index: startIndex + node.nodes[amountArgIndex].sourceIndex,
              endIndex: startIndex + node.nodes[amountArgIndex].sourceEndIndex -
                1,
            });
          }
        }
      });
      decl.value = parsed.toString();
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
