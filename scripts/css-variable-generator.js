/**
 * Retrieves all CSS custom properties (variables) from the document's style sheets.
 * @returns {[string, string][]} An array of key-value pairs where the key is the CSS variable name and the value is its definition.
 */
const getAllCssVariables = () =>
  [...document.styleSheets]
    .filter(({ href }) => !href || href.startsWith(window.location.origin))
    .flatMap(({ cssRules }) =>
      [...cssRules]
        .filter(({ type }) => type === 1)
        .flatMap(({ style }) =>
          [...style]
            .filter((propName) => propName.startsWith("--"))
            .map((propName) => [
              propName.trim(),
              style.getPropertyValue(propName).trim(),
            ])
        )
    );

/**
 * An object containing theme color arrays for different themes.
 * @type {{ mocha: [string, string][], latte: [string, string][] }}
 */
const themeColors = {
  mocha: [
    ["rosewater", "#f5e0dc"],
    ["flamingo", "#f2cdcd"],
    ["pink", "#f5c2e7"],
    ["mauve", "#cba6f7"],
    ["red", "#f38ba8"],
    ["maroon", "#eba0ac"],
    ["peach", "#fab387"],
    ["yellow", "#f9e2af"],
    ["green", "#a6e3a1"],
    ["teal", "#94e2d5"],
    ["sky", "#89dceb"],
    ["sapphire", "#74c7ec"],
    ["blue", "#89b4fa"],
    ["lavender", "#b4befe"],
    ["text", "#cdd6f4"],
    ["subtext1", "#bac2de"],
    ["subtext0", "#a6adc8"],
    ["overlay2", "#9399b2"],
    ["overlay1", "#7f849c"],
    ["overlay0", "#6c7086"],
    ["surface2", "#585b70"],
    ["surface1", "#45475a"],
    ["surface0", "#313244"],
    ["base", "#1e1e2e"],
    ["mantle", "#181825"],
    ["crust", "#11111b"],
  ],
  latte: [
    ["rosewater", "#dc8a78"],
    ["flamingo", "#dd7878"],
    ["pink", "#ea76cb"],
    ["mauve", "#8839ef"],
    ["red", "#d20f39"],
    ["maroon", "#e64553"],
    ["peach", "#fe640b"],
    ["yellow", "#df8e1d"],
    ["green", "#40a02b"],
    ["teal", "#179299"],
    ["sky", "#04a5e5"],
    ["sapphire", "#209fb5"],
    ["blue", "#1e66f5"],
    ["lavender", "#7287fd"],
    ["text", "#4c4f69"],
    ["subtext1", "#5c5f77"],
    ["subtext0", "#6c6f85"],
    ["overlay2", "#7c7f93"],
    ["overlay1", "#8c8fa1"],
    ["overlay0", "#9ca0b0"],
    ["surface2", "#acb0be"],
    ["surface1", "#bcc0cc"],
    ["surface0", "#ccd0da"],
    ["base", "#eff1f5"],
    ["mantle", "#e6e9ef"],
    ["crust", "#dce0e8"],
  ],
};

/**
 * Checks if the given string is a valid hexadecimal color.
 * @param {string} str - The string to check.
 * @returns {boolean} True if the string is a valid hex color, false otherwise.
 */
const isHex = (str) => /^#([0-9a-f]{3,4}|[0-9a-f]{6,8})$/i.test(str);

/**
 * Checks if the given string is a valid CSS rgb or rgba color function.
 * @param {string} str - The string to check.
 * @returns {boolean} True if the string is a valid rgb or rgba color function, false otherwise.
 */
const isRgb = (str) =>
  (str.startsWith("rgb(") || str.startsWith("rgba(")) && str.endsWith(")");

/**
 * Parses a CSS rgb or rgba color function into an object with red, green, blue, and opacity values.
 * @param {string} rgb - The CSS rgb or rgba function.
 * @returns {{ r: number, g: number, b: number, opacity: number }} An object with the red, green, blue, and opacity values.
 */
const parseRgb = (rgb) => {
  const [r, g, b, opacity = 1] = rgb
    .replace(/rgba?\((.*?)\)/, "$1")
    .split(",")
    .map((v, i) => (i < 3 && v.includes("%") ? (parseFloat(v) * 255) / 100 : +v));
  return { r, g, b, opacity };
};

const rgb2lab = ({ r, g, b }) => {
  let red = r / 255,
    green = g / 255,
    blue = b / 255,
    x,
    y,
    z;

  red = red > 0.04045 ? Math.pow((red + 0.055) / 1.055, 2.4) : red / 12.92;
  green =
    green > 0.04045 ? Math.pow((green + 0.055) / 1.055, 2.4) : green / 12.92;
  blue = blue > 0.04045 ? Math.pow((blue + 0.055) / 1.055, 2.4) : blue / 12.92;

  x = (red * 0.4124 + green * 0.3576 + blue * 0.1805) / 0.95047;
  y = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 1.0;
  z = (red * 0.0193 + green * 0.1192 + blue * 0.9505) / 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : 7.787 * x + 16 / 116;
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : 7.787 * y + 16 / 116;
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : 7.787 * z + 16 / 116;

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
};

const getDe2000DistanceBetweenTwoColors = (l1, a1, b1, l2, a2, b2) => {
  Math.rad2deg = function (rad) {
    return (360 * rad) / (2 * Math.PI);
  };
  Math.deg2rad = function (deg) {
    return (2 * Math.PI * deg) / 360;
  };
  const avgL = (l1 + l2) / 2;
  const c1 = Math.sqrt(Math.pow(a1, 2) + Math.pow(b1, 2));
  const c2 = Math.sqrt(Math.pow(a2, 2) + Math.pow(b2, 2));
  const avgC = (c1 + c2) / 2;
  const g =
    (1 - Math.sqrt(Math.pow(avgC, 7) / (Math.pow(avgC, 7) + Math.pow(25, 7)))) /
    2;

  const a1p = a1 * (1 + g);
  const a2p = a2 * (1 + g);

  const c1p = Math.sqrt(Math.pow(a1p, 2) + Math.pow(b1, 2));
  const c2p = Math.sqrt(Math.pow(a2p, 2) + Math.pow(b2, 2));

  const avgCp = (c1p + c2p) / 2;

  let h1p = Math.rad2deg(Math.atan2(b1, a1p));
  if (h1p < 0) {
    h1p = h1p + 360;
  }

  let h2p = Math.rad2deg(Math.atan2(b2, a2p));
  if (h2p < 0) {
    h2p = h2p + 360;
  }

  const avghp =
    Math.abs(h1p - h2p) > 180 ? (h1p + h2p + 360) / 2 : (h1p + h2p) / 2;

  const t =
    1 -
    0.17 * Math.cos(Math.deg2rad(avghp - 30)) +
    0.24 * Math.cos(Math.deg2rad(2 * avghp)) +
    0.32 * Math.cos(Math.deg2rad(3 * avghp + 6)) -
    0.2 * Math.cos(Math.deg2rad(4 * avghp - 63));

  let deltahp = h2p - h1p;
  if (Math.abs(deltahp) > 180) {
    if (h2p <= h1p) {
      deltahp += 360;
    } else {
      deltahp -= 360;
    }
  }

  const deltalp = l2 - l1;
  const deltacp = c2p - c1p;

  deltahp = 2 * Math.sqrt(c1p * c2p) * Math.sin(Math.deg2rad(deltahp) / 2);

  const sl =
    1 +
    (0.015 * Math.pow(avgL - 50, 2)) / Math.sqrt(20 + Math.pow(avgL - 50, 2));
  const sc = 1 + 0.045 * avgCp;
  const sh = 1 + 0.015 * avgCp * t;

  const deltaro = 30 * Math.exp(-Math.pow((avghp - 275) / 25, 2));
  const rc =
    2 * Math.sqrt(Math.pow(avgCp, 7) / (Math.pow(avgCp, 7) + Math.pow(25, 7)));
  const rt = -rc * Math.sin(2 * Math.deg2rad(deltaro));

  const kl = 1;
  const kc = 1;
  const kh = 1;

  const deltaE = Math.sqrt(
    Math.pow(deltalp / (kl * sl), 2) +
      Math.pow(deltacp / (kc * sc), 2) +
      Math.pow(deltahp / (kh * sh), 2) +
      rt * (deltacp / (kc * sc)) * (deltahp / (kh * sh)),
  );

  return deltaE;
};

const parseHex = (hex) => {
  const shortForm = hex.length <= 5;
  const [r, g, b, opacity = 255] = shortForm
    ? hex
        .slice(1)
        .match(/./g)
        .map((v) => parseInt(v + v, 16))
    : hex
        .slice(1)
        .match(/.{2}/g)
        .map((v) => parseInt(v, 16));
  return { r, g, b, opacity: opacity / 255 };
};

/**
 * Finds the closest color in an array to the target color.
 * @param {string} target - The hex target color object.
 * @param {[string, string][]} colors - An array of color names and hex values to compare against the target color.
 * @returns {string} The name of the closest color in the format "@colorName".
 */
const closestColor = (target, colors) => {
  const distances = colors.map(([name, color]) => [
    name,
    getDe2000DistanceBetweenTwoColors(
      ...rgb2lab(target),
      ...rgb2lab(parseHex(color)),
    ),
  ]);
  const [closestName] = distances.reduce((min, cur) =>
    cur[1] < min[1] ? cur : min,
  );

  return `@${closestName}`;
};

/**
 * Checks if the given string is a valid CSS var() function.
 * @param {string} str - The string to check.
 * @returns {boolean} True if the string is a valid CSS var() function, false otherwise.
 */
const isVar = (str) => str.startsWith("var(") && str.endsWith(")");

/**
 * Parses a CSS variable value into an object with red, green, blue, and opacity values.
 * @param {string} value - The value of the CSS variable.
 * @returns {{ r: number, g: number, b: number, opacity: number } | false} An object with the red, green, blue, and opacity values, or false if parsing failed.
 */
const parseCssVariableValue = (value) =>
  isHex(value)
    ? parseHex(value)
    : isRgb(value)
    ? parseRgb(value)
    : isVar(value)
    ? parseVar(value)
    : false;

/**
 * Parses a CSS variable reference into its corresponding color value.
 * @param {string} cssVar - The CSS variable reference.
 * @returns {{ r: number, g: number, b: number, opacity: number } | false} The color value object or false if parsing failed.
 */
const parseVar = (cssVar) => {
  const cssVarEntry = getAllCssVariables().find(
    ([name]) => name === cssVar.slice(4, -1)
  );
  return cssVarEntry ? parseCssVariableValue(cssVarEntry[1]) : false;
};

/**
 * Converts CSS variables to a new theme by mapping them to the closest colors in the given theme.
 * @param {[string, string][]} theme - The array of theme colors to match against.
 * @returns {[string, string][]} An array of new CSS variables with their updated values based on the closest theme colors.
 */
const newCssVariables = (theme) => {
  return getAllCssVariables()
    .flatMap(([name, value]) => {
      const parsed = parseCssVariableValue(value);
      if (parsed) {
        const closest = closestColor(parsed, theme);
        const newValue = parsed.opacity === 1 
          ? closest 
          : `fade(${closest}, ${Math.round(parsed.opacity * 100)}%)`;
        return [[name, newValue]];
      }
      return [];
    });
};


/**
 * Generates a CSS string for the new theme based on the given color palette.
 * @param {[string, string][]} theme - The array of theme colors, where each entry is a tuple containing the color name and its hex value.
 * @returns {string} A CSS string representing the new theme with updated color values.
 */
const getNewTheme = (theme) =>
  newCssVariables(theme)
    .map(([name, value]) => `${name}: ${value};`)
    .join("\n");

/**
 * Generates CSS strings for light mode, dark mode, and all CSS variables (unmodified).
 * @type {[string, string, string]}
 */
const [lightModeString, darkModeString, allCssVariablesString] = [
  getNewTheme(themeColors.latte),
  getNewTheme(themeColors.mocha),
  getAllCssVariables()
    .map(([name, value]) => `${name}: ${value};`)
    .join("\n"),
];

/**
 * Creates and styles a button element with a click event listener.
 * @param {string} text - The text content of the button.
 * @param {string} top - The top position of the button (e.g., "2rem").
 * @param {string} bgColor - The background color of the button.
 * @param {string} textColor - The text color of the button.
 * @param {Function} onClick - The function to be called when the button is clicked.
 * @returns {HTMLButtonElement} The created button element.
 */
const createButton = (text, top, bgColor, textColor, onClick) => {
  const btn = document.createElement("button");
  Object.assign(btn.style, {
    position: "absolute",
    zIndex: "10000000000",
    top,
    left: "2rem",
    width: "10rem",
    height: "10rem",
    backgroundColor: bgColor,
    color: textColor,
  });
  btn.textContent = text;
  btn.addEventListener("click", onClick);
  document.body.appendChild(btn);
  return btn;
};

/**
 * Creates a set of buttons for user interaction, including buttons to copy different CSS variables and remove all buttons.
 * @type {HTMLButtonElement[]}
 */
const buttons = [
  createButton(
    "LIGHT - Click if the script was run while the website had a light theme",
    "2rem",
    "#cdd6f4",
    "#1e1e2e",
    () => navigator.clipboard.writeText(lightModeString)
  ),
  createButton(
    "DARK - Click if the script was run while the website had a dark theme",
    "14rem",
    "#1e1e2e",
    "#cdd6f4",
    () => navigator.clipboard.writeText(darkModeString)
  ),
  createButton(
    "ALL - Click to copy ALL CSS VARIABLES (unmodified)",
    "26rem",
    "#fab387",
    "#11111b",
    () => navigator.clipboard.writeText(allCssVariablesString)
  ),
  createButton(
    "REMOVE BUTTONS",
    "38rem",
    "#eba0ac",
    "#11111b",
    () => buttons.forEach((btn) => document.body.removeChild(btn))
  ),
];

/**
 * Scrolls the window to the top of the page.
 */
scrollTo({ top: 0 });

console.log(
  "%c Success!",
  "background:#a6e3a1;color:#1e1e2e;font-weight:bold;font-size:1.6rem;padding:0.2rem;"
);

console.log(
  `%c I was able to convert ${
    newCssVariables(themeColors.latte).length
  } / ${getAllCssVariables().length} css variables from this site to Catppuccin theme.`,
  "color:#89dceb;background:#1e1e2e;font-size:1.2rem;"
);

console.log(
  `%c If this website had a light theme **when you ran this script**, click on the "LIGHT" button. 
Else click on the "DARK" button (otherwise the colors will be wrong)`,
  "color:#cdd6f4;background:#1e1e2e;font-size:1.2rem;"
);
