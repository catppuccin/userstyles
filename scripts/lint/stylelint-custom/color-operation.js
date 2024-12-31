// @ts-check

import stylelint from "stylelint";
import valueParser from "postcss-value-parser";

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

/**
 * @param {string} amount
 * @returns {string}
 */
function numberToPercentage(amount) {
  let value = Number.parseFloat(amount);
  if (value < 1) value *= 100;
  return value + "%";
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

        // Prevent using `rgba` with variables to change the alpha value.
        if (
          node.value === "rgba" &&
          node.nodes.length === 3 &&
          node.nodes[0].value.startsWith("@") &&
          NUMERICAL_VALUE_REGEX.test(node.nodes[2].value)
        ) {
          if (context.fix) {
            node.value = "fade";
            node.nodes[2].value = numberToPercentage(node.nodes[2].value);
          } else {
            report({
              result,
              ruleName,
              message: messages.rgba_used_with_variable(),
              node: decl,
            });
          }
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
            node.nodes[amountArgIndex].value = numberToPercentage(value);
          } else {
            report({
              result,
              ruleName,
              message: messages.amount_not_percentage(),
              node: decl,
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
