import stylelint from "stylelint";
import valueParser from "postcss-value-parser";

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = "catppuccin/require-color-op-func-percentage";

const meta = {
  fixable: true,
};

const messages = ruleMessages(ruleName, {
  rejected: () =>
    `Color operation function amount arguments must be percentages`,
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

      if (
        parsed.nodes.length === 1 &&
        parsed.nodes[0].type === "function" &&
        [
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
        ].includes(parsed.nodes[0].value)
      ) {
        const func = parsed.nodes[0];

        const numArgLoc = parsed.nodes[0].value === "mix" ? 4 : 2;

        if (
          func.nodes.length === numArgLoc + 1 &&
          !func.nodes[numArgLoc].value.endsWith("%")
        ) {
          const value = func.nodes[numArgLoc].value;
          if (!/^[\d.]+$/.test(value)) return;

          let num = value;
          if (value.includes(".")) {
            num = Number.parseFloat(value);
          }

          if (context.fix) {
            func.nodes[numArgLoc].value = num + "%";
            decl.value = parsed.toString();
          } else {
            report({
              result,
              ruleName,
              message: messages.rejected(),
              node: decl,
            });
          }
        }
      }
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
