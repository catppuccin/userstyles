---
title: Images and SVGs
description: Guide for theming images and SVGs in userstyles.
sidebar:
  order: 2
---

## Monochrome `<img>` elements

If you encounter an `<img>` element with single colored contents, the easiest way to theme it is to apply a CSS color filter. The `@<color>-filter` filters can be used to theme Catppuccin colours.

For example:

```css
img.twitter-icon {
  filter: @blue-filter;
}
```

## SVGs as `background-image`s

Websites will sometimes use the `background-image` CSS property to apply an SVG, often for icons. The value of the `background-image` is usually either a URL to an external SVG resource, such as `url("https://example.org/assets/xyz.svg")`, or an inlined SVG [data URL](https://developer.mozilla.org/en-US/docs/Web/URI/Reference/Schemes/data), like `url("data:image/svg+xml,%3Csvg%3E...%3C/svg%3E");`.

### External SVG URL

Below is an example of what a rule for an external SVG URL could look like.

```css
.xyz {
  background-image: url("https://example.org/assets/xyz.svg");
}
```

To obtain the contents of this remote SVG resource, you can either:

- Visit the URL of the SVG, right click and select **View Page Source**, and copy its contents from the resulting page.
- Run `curl "https://example.org/assets/xyz.svg"` and copy the contents from the terminal output.

> [!TIP]
> On macOS, copy the SVG contents after `curl`-ing automatically with `| pbcopy`: `curl "https://example.org/assets/xyz.svg" | pbcopy`.

### Inlined SVG data URL

Below is an example of what a rule for an inlined SVG data URL could look like.

```css
.xyz {
  background-image: url("data:image/svg+xml,%3Csvg%20viewBox%3D%220%200%2024%2024%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cpath%20fill%3D%22red%22%20d%3D%22%22/%3E%3C/svg%3E");
}
```

The text after `data:image/svg+xml,` is URL encoded. To get the contents of the SVG, the string needs to be URL decoded.

There are two ways to do this:

- Using the JavaScript built-in function `decodeURIComponent`. You can run `node -e 'console.log(decodeURIComponent("..."))'`, with the URL encoded SVG contents placed between the double quotes in place of `...`.
- Use an online tool such as [urldecoder.io](https://www.urldecoder.io/).

---

Once you have obtained the SVG contents, paste them in between the single quotes of `escape('')` in the following template:

<!-- deno-fmt-ignore -->
```less
.xyz {
  @svg: escape('');
  background-image: url("data:image/svg+xml,@{svg}");
}
```

> [!NOTE]
> Ensure `escape()` uses single quotes, not double quotes, before pasting the SVG contents — `escape('')`, not `escape("")`.

> [!WARNING]
> The error `Invalid % without number` appears until an interpolated color is added in the SVG contents. This is covered in the following section.

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

## External SVGs through `<img>` elements

Theming an external SVG referenced from an `<img>` element is similar. However, the `content` property is used instead of `background-image` to replace the image.

As with the previous tip for `background-image`, only the SVG inside of the `escape('')` needs to be updated.

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
