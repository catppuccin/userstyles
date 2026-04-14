---
title: Syntax Highlighting
description: Guide for theming syntax highlighting in userstyles.
sidebar:
  order: 3
---

If a website uses [highlight.js](https://highlightjs.org/), [Pygments](https://pygments.org/), [Prism.js](https://prismjs.com/), or [Chroma](https://github.com/alecthomas/chroma) for syntax highlighting, follow the steps for the syntax higlighter in use below. First though, you'll need to add the following line near the top of the `#catppuccin` mixin, under `#lib.palette();`/`#lib.defaults();`, to include the necessary CSS variables:

```css
#lib.css-variables();
```

## highlight.js

After including the CSS variables with the mixin specified above, add the following line at the top of the userstyle, beneath the `@-moz-document` line.

```css
@import url("https://unpkg.com/@catppuccin/highlightjs@1.0.0/css/catppuccin-variables.important.css");
```

## Pygments

After including the CSS variables with the mixin specified above, add the following line at the top of the userstyle, beneath the `@-moz-document` line.

```css
@import url("https://python.catppuccin.com/pygments/catppuccin-variables.important.css");
```

## Prism.js

After including the CSS variables with the mixin specified above, add the following line at the top of the userstyle, beneath the `@-moz-document` line.

```css
@import url("https://prismjs.catppuccin.com/variables.important.css");
```

## Chroma

After including the CSS variables with the mixin specified above, add the following lines at the top of the userstyle, beneath the `@-moz-document` line.

```css
@import (css)
  url("https://chroma.catppuccin.com/@{lightFlavor}-chroma-style.css")
  (prefers-color-scheme: light);
@import (css)
  url("https://chroma.catppuccin.com/@{darkFlavor}-chroma-style.css")
  (prefers-color-scheme: dark);
```

> [!IMPORTANT]
> The above snippet for Chroma only works properly for userstyles that use browser/system media queries to apply the `#catppuccin` mixin. If a userstyle targets a specific attribute/element on the website to apply the mixin, this will not work all of the time.
