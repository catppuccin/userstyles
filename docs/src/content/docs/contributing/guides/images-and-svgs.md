---
title: Images and SVGs
description: Guide for theming images and SVGs in userstyles.
sidebar:
  order: 2
---

## SVGs as `background-image`s

Websites will sometimes use the `background-image` CSS property to apply an SVG, often for icons. We will refer to these as "external SVGs" throughout the rest of this guide, as the SVGs are usually at a different URL and linked to with [`url()`](https://developer.mozilla.org/en-US/docs/Web/CSS/url). Below is an example of what a rule for an external SVG could look like.

```css
.xyz {
  background-image: url("https://example.org/assets/xyz.svg");
}
```

The easiest way to theme external SVGs is to visit the URL of the SVG and paste its contents in between the single quotes of the `escape('')` section of the following template:

```less
.xyz {
  @svg: escape("<svg>...</svg>");
  background-image: url("data:image/svg+xml,@{svg}");
}
```

> [!NOTE]
> The `Invalid % without number` error may appear if you have not done the following step. Make sure to add/replace an interpolated color in the SVG contents (as is detailed below) for this error to go away.

Now, replace any colors in the SVG with their respective Catppuccin variants. For example, take the following SVG icon for Twitter:

```xml
<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#1D9BF0" d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148 13.98 13.98 0 0 0 11.82 8.292a4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z"/></svg>
```

There is only one color used, `fill="#1D9BF0"`. That hex code is a shade of blue, so we can replace it with the `@blue` color using the `fill="@{<color>}"` syntax ([variable interpolation](https://lesscss.org/features/#variables-feature-variable-interpolation)).

```less
.twitter-icon {
  @svg: escape(
    '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="@{blue}" d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148 13.98 13.98 0 0 0 11.82 8.292a4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z"/></svg>'
  );
  background-image: url("data:image/svg+xml,@{svg}");
}
```

## `<img>` elements

Theming an inline image is similar, but `content` is used instead of `background-image` to cover up the original image with our new one. As with the previous tip for `background-image`, you only need to update the SVG inside of the `escape('')` (see above for details).

```less
img.xyz {
  @svg: escape("<svg>...</svg>");
  content: url("data:image/svg+xml,@{svg}");
}
```

Again, following the example of theming a Twitter logo:

```less
img.twitter-icon {
  @svg: escape(
    '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="@{blue}" d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148 13.98 13.98 0 0 0 11.82 8.292a4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z"/></svg>'
  );
  content: url("data:image/svg+xml,@{svg}");
}
```

## Non-SVG images or many `<img>` elements with external SVGs

If you encounter non-SVG images, or many `<img>` elements that are single-colored, the best approach is to apply a CSS color filter to the images. You can use the `@<color>-filter` variables provided out of the box.

For example:

```css
img.twitter-icon {
  filter: @blue-filter;
}
```
