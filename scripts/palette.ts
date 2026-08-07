import {
  type AccentName,
  flavorEntries,
  flavors,
} from "@catppuccin/palette/mod.ts";

const longestFlavorIdentifierLength = Math.max(
  ...Object.keys(flavors).map((key) => key.length),
);

const PALETTE_BLOCK = `@catppuccin: {
${
  flavorEntries.map(([fid, flavor]) => {
    const padding = " ".repeat(longestFlavorIdentifierLength - fid.length);

    function formatTintsAndShades(cid: AccentName) {
      const tints = Object.values(flavor.tints[cid])
        .map((t) => `@t${t.order + 1}: ${t.hex};`);
      const shades = Object.values(flavor.shades[cid])
        .map((s) => `@s${s.order + 1}: ${s.hex};`);
      return `{ ${
        [...tints, ...shades, `@default: ${flavor.colors[cid].hex};`].join(" ")
      } }`;
    }

    const colors = flavor.colorEntries.map(([cid, color]) => {
      const value = color.accent
        ? formatTintsAndShades(cid as AccentName)
        : color.hex;
      return `@${cid}: ${value};`;
    }).join(" ");

    return `  @${fid}: ${padding}{ ${colors} };`;
  }).join("\n")
}
};`;

console.log(PALETTE_BLOCK);
