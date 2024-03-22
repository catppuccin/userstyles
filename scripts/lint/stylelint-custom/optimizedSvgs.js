import stylelint from "npm:stylelint";
import valueParser from "npm:postcss-value-parser";
import { optimize } from "npm:svgo";

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = "catppuccin/optimized-svgs";

const meta = {
  fixable: true,
}

const messages = ruleMessages(ruleName, {
  rejected: () => `Unoptimized SVG detected`,
});


/** @type {import('npm:stylelint').Rule} */
const ruleFunction = (primary, secondary, context) => {
  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, {
      actual: primary,
      possible: [true],
    });

    if (!validOptions) return;

    root.walkRules((rule) => {
      for (const node of rule.nodes) {
        if (node.type === "rule") {
          for (const subnode of node.nodes) {
            if (subnode.type === "atrule" && subnode.name === "svg") {
              const parsed = valueParser(subnode.value).nodes;


              if (
                parsed.length === 1 && parsed[0].type === "function" &&
                parsed[0].value === "escape" &&
                parsed[0].nodes.length === 1 &&
                parsed[0].nodes[0].type === "string"
              ) {

                const svg = parsed[0].nodes[0].value;
                const optimized = optimize(svg).data;

                if (optimized !== svg) {
                  if (context.fix) {
                    subnode.value = subnode.value.replace(svg, optimized)
                    return;
                  }
                  report({
                    result,
                    ruleName,
                    message: messages.rejected(),
                    node: subnode,
                  });
                };
              }
            }
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
