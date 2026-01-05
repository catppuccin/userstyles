import colorOperation from "@/lint/stylelint-custom/color-operation.js";
import optimizedSvgs from "@/lint/stylelint-custom/optimized-svgs.js";
import redundantParentSelector from "@/lint/stylelint-custom/redundant-parent-selector.js";

export default [
  colorOperation,
  optimizedSvgs,
  redundantParentSelector,
];
