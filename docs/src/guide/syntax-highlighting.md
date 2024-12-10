If a website uses [highlight.js](https://highlightjs.org/), [Pygments](https://pygments.org/), or [Prism.js](https://prismjs.com/) for syntax highlighting, follow the steps for the syntax higlighter in use below. First though, you'll need to add the following lines beneath the color definition section (`@<color>: @catppuccin[@@lookup][@<color>];`) in the `#catppuccin` mixin:

```css
--ctp-rosewater: @rosewater;
--ctp-flamingo: @flamingo;
--ctp-pink: @pink;
--ctp-mauve: @mauve;
--ctp-red: @red;
--ctp-maroon: @maroon;
--ctp-peach: @peach;
--ctp-yellow: @yellow;
--ctp-green: @green;
--ctp-teal: @teal;
--ctp-sky: @sky;
--ctp-sapphire: @sapphire;
--ctp-blue: @blue;
--ctp-lavender: @lavender;
--ctp-text: @text;
--ctp-subtext1: @subtext1;
--ctp-subtext0: @subtext0;
--ctp-overlay2: @overlay2;
--ctp-overlay1: @overlay1;
--ctp-overlay0: @overlay0;
--ctp-surface2: @surface2;
--ctp-surface1: @surface1;
--ctp-surface0: @surface0;
--ctp-base: @base;
--ctp-mantle: @mantle;
--ctp-crust: @crust;
```

## highlight.js

Add the following line at the top of the userstyle, beneath the `@-moz-document` line.

```css
@import url("https://unpkg.com/@catppuccin/highlightjs@1.0.0/css/catppuccin-variables.important.css");
```

## Pygments

Add the following line at the top of the userstyle, beneath the `@-moz-document` line.

```css
@import url("https://python.catppuccin.com/pygments/catppuccin-variables.important.css");
```

## Prism.js

Add the following line at the top of the userstyle, beneath the `@-moz-document` line.

```css
@import url("https://prismjs.catppuccin.com/variables.css");
```

## Chroma

Add the following lines to the top of the userstyle, beneath the `@-moz-document` line.

```css
@import (css)
  url("https://chroma.catppuccin.com/@{lightFlavor}-chroma-style.css")
  (prefers-color-scheme: light);
@import (css)
  url("https://chroma.catppuccin.com/@{darkFlavor}-chroma-style.css")
  (prefers-color-scheme: dark);
```

> [!IMPORTANT]
> The above snippet only works properly for userstyles that use browser/system media queries to apply the `#catppuccin` mixin. If a userstyle targets a specific attribute/element on the website to apply the mixin, this will not work all of the time.
