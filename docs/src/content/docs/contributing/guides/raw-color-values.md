---
title: Raw color values
description: Guide for obtaining raw color values of palette colors in RGB or HSL formats.
sidebar:
  order: 4
---

## Obtaining RGB values

You can use the `#lib.rgbify()` utility mixin to get the raw RGB values from a color.

```less
--ctp-base: #lib.rgbify(@base) []; // -> 30, 30, 46
```

## Obtaining HSL values

You can use the `#lib.hslify()` utility mixin to get the raw HSL values from a color.

```less
--ctp-base: #lib.hslify(@base) []; // -> 240, 21.052631578947366%, 14.901960784313726%
```
