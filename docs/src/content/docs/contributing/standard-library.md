---
title: Standard Library
description: Reference to using the standard library.
---

The standard library is a collection of mixins to simplify and prevent redundant code in userstyles. The source code is at [`lib/lib.less`](https://github.com/catppuccin/userstyles/blob/main/lib/lib.less) and the library is hosted at https://userstyles.catppuccin.com/lib/lib.less.

In userstyles, the standard library is imported at the top like so (along with other [library modules](/contributing/library-modules/)):

```less
@import "https://userstyles.catppuccin.com/lib/lib.less";
```

## API

The standard library exposes a `#lib` namespace.

### `#lib.palette()`

The standard library palette mixin provides Less variable definitions for hex colors and CSS filters from the palette. Call the mixin at the top of the `#catppuccin` mixin to inject the variables into the userstyle context. This is used in all userstyles.

### `#lib.defaults()`

The standard library defaults mixin provides a set of default styles for text selection and native/input elements. This is generally applied in all userstyles, with some exceptions.

### `#lib.rgbify()`

The standard library `rgbify` mixin is a utility mixin for extracting the color in `r, g, b` format from a palette variable.

#### Examples

```less
--my-variable-rgb: #lib.rgbify(@base) []; // -> 30, 30, 46
```

### `#lib.hslify()`

The standard library `hslify` mixin is a utility mixin for extracting the color in `h, s, l` format from a palette variable.

#### Examples

```less
--my-variable-hsl: #lib.hslify(@base) []; // -> 240, 21.052631578947366%, 14.901960784313726%
```

### `#lib.css-variables()`

The standard library CSS variables mixin provides the palette variables in [CSS variable/custom property](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascading_variables/Using_CSS_custom_properties) form. This is commonly used alongside [syntax highlighting imports](/contributing/guides/syntax-highlighting/).
