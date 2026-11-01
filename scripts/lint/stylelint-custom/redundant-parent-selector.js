// @ts-check

import assert from "node:assert/strict";

import stylelint from "stylelint";

const {
  createPlugin,
  utils: { report, ruleMessages, validateOptions },
} = stylelint;

const ruleName = "catppuccin/no-redundant-parent-selector";

const meta = {
  url:
    "https://github.com/catppuccin/userstyles/blob/main/scripts/lint/stylelint-custom/redundant-parent-selector.js",
  fixable: true,
};

const messages = ruleMessages(ruleName, {
  rejected: () => `Redundant parent selector is not allowed`,
});

/** @type {import('stylelint').Rule} */
const ruleFunction = (primary) => {
  return (root, result) => {
    const validOptions = validateOptions(result, ruleName, {
      actual: primary,
      possible: [true],
    });

    if (!validOptions) return;

    root.walkRules((rule) => {
      if (rule.selectors.length === 1 && rule.selector === "&") {
        report({
          result,
          ruleName,
          message: messages.rejected(),
          node: rule,
          fix: () => {
            // Moves the rule's properties to the parent rule *in place* of the parent selector.
            // & {
            //   color: red;
            // }
            // becomes
            // color: red;

            const parent = rule.parent;

            if (parent) {
              let idx = parent.index(rule);
              assert(idx !== -1);

              rule.each((node) => {
                if (node.type === "decl") {
                  parent.insertAfter(
                    parent.nodes[idx],
                    node.clone(),
                  );
                  idx++;
                }
              });

              rule.remove();
            }
          },
        });
      }

      rule.selector = rule.selector.replace(
        // Match "& ", at the start or after a comma and optional whitespace, but not when followed by "when".
        /(^|,\s*)&\s+(?!when\b)/g,
        (match, prefix, offset) => {
          const matchIndex = offset + prefix.length;
          const matchEndIndex = matchIndex + 1; // `&` is one character long.

          // `report` calls `fix` synchronously when fixing is enabled.
          let fixed = false;
          report({
            result,
            ruleName,
            message: messages.rejected(),
            node: rule,
            index: matchIndex,
            endIndex: matchEndIndex,
            fix: () => {
              fixed = true;
            },
          });
          // Remove '& ' but keep the "prefix" (start or comma and whitespace).
          return fixed ? prefix : match;
        },
      );
    });
  };
};

ruleFunction.ruleName = ruleName;
ruleFunction.messages = messages;
ruleFunction.meta = meta;

export default createPlugin(ruleName, ruleFunction);
