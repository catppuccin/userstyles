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
};

const messages = ruleMessages(ruleName, {
  rejected: () => `Unoptimized SVG detected`,
});

/** @type {import('npm:stylelint').Rule} */
const ruleFunction = (primary, _secondary, context) => {
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
              const parsed = valueParser(subnode.value);

              if (
                parsed.nodes.length === 1 &&
                parsed.nodes[0].type === "function" &&
                parsed.nodes[0].value === "escape" &&
                parsed.nodes[0].nodes.length === 1 &&
                parsed.nodes[0].nodes[0].type === "string"
              ) {
                const svg = parsed.nodes[0].nodes[0].value;
                const optimized = optimize(svg, {
                  multipass: true,
                  plugins: [
                    "cleanupAttrs",
                    "cleanupIds",
                    "collapseGroups",
                    "convertPathData",
                    "convertTransform",
                    "convertStyleToAttrs",
                    "mergePaths",
                    "removeComments",
                    "removeUselessDefs",
                    "removeScriptElement"
                  ],
                }).data;

                if (optimized !== svg) {
                  if (context.fix) {
                    parsed.nodes[0].nodes[0].quote = "'";
                    parsed.nodes[0].nodes[0].value = optimized;
                    subnode.value = parsed.toString();
                  } else {
                    report({
                      result,
                      ruleName,
                      message: messages.rejected(),
                      node: subnode,
                    });
                  }
                }
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
