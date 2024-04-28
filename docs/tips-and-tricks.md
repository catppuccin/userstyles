<p align="center">
  <h2 align="center">📖 Tips and tricks for writing a userstyle</h2>
</p>

&nbsp;

### Table of Contents

<!--toc:start-->

- [How can I see my changes in real time?](#how-can-i-see-my-changes-in-real-time)
- [How can I hide sensitive information in preview screenshots?](#how-can-i-hide-sensitive-information-in-preview-screenshots)
- [How do I convert preview images to WebP?](#how-do-i-convert-preview-images-to-webp)
  - [Installation](#installation)
  - [Usage](#usage)
- [How do I theme images and SVGs?](#how-do-i-theme-images-and-svgs)
  - [SVG background images](#svg-background-images)
  - [`<img>` elements](#img-elements)
- [How do I set a variable to RGB values?](#how-do-i-set-a-variable-to-rgb-values)
- [How can I inspect hard-to-grab elements?](#how-can-i-inspect-hard-to-grab-elements)
<!--toc:end-->

### How can I see my changes in real time?

See ["Initial installation and live reload" - Stylus Wiki](https://github.com/openstyles/stylus/wiki/Writing-UserCSS#initial-installation-and-live-reload).

&nbsp;

### How can I hide sensitive information in preview screenshots?

When taking screenshots of userstyles, you may want to hide sensitive information (such as your username, email, etc.).

You may use the [Flow Circular](https://fonts.google.com/specimen/Flow+Circular) font to redact details by obscuring any text on the page.

Use this snippet at the top of your userstyle to import and use the font:

```less
@import url("https://fonts.googleapis.com/css2?family=Flow+Circular&display=swap");

* {
  font-family: "Flow Circular", cursive;
}
```

&nbsp;

### How do I convert preview images to WebP?

The Catppuccin project prefers to use the [WebP image format](https://en.wikipedia.org/wiki/WebP) for the asset preview images. We recommend using Google's [`cwebp`](https://developers.google.com/speed/webp/docs/cwebp) conversion utility to convert images to WebP.

#### Installation

| Method                                | Instructions                                                                           |
| ------------------------------------- | -------------------------------------------------------------------------------------- |
| [Homebrew](https://brew.sh/)          | `brew install webp` [[view cask]](https://formulae.brew.sh/formula/webp)               |
| [MacPorts](https://www.macports.org/) | `sudo port install webp` [[view port]](https://ports.macports.org/port/webp/)          |
| Binaries                              | See https://storage.googleapis.com/downloads.webmproject.org/releases/webp/index.html. |

#### Usage

> [!TIP]
> See [the full documentation on `cwebp`](https://developers.google.com/speed/webp/docs/cwebp) for further reference.

```
cwebp -lossless old-image.png -o new-image.webp
```

The command above is converting the input image `old-image.png` to the output file `new-image-webp`, with a lossless quality conversion.

&nbsp;

### How do I theme images and SVGs?

#### SVG background images

Often, websites will use a CSS rule to apply an SVG as a `background-image` (typically for icons). We will refer to these as "external SVGs" throughout the rest of this guide. Below is an example of what a rule for an external SVG could look like.

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

Now, replace any colors in the SVG with their respective Catppuccin variants. For example, take the following SVG icon for Twitter:

```xml
<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="#1D9BF0" d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148 13.98 13.98 0 0 0 11.82 8.292a4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z"/></svg>
```

There is only one color used, `fill="#1D9BF0"`. That hex code is a shade of blue, so we can replace it with the `@blue` color using the `fill="@{<color>}"` syntax.

```less
.twitter-icon {
  @svg: escape(
    '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="@{blue}" d="M21.543 7.104c.015.211.015.423.015.636 0 6.507-4.954 14.01-14.01 14.01v-.003A13.94 13.94 0 0 1 0 19.539a9.88 9.88 0 0 0 7.287-2.041 4.93 4.93 0 0 1-4.6-3.42 4.916 4.916 0 0 0 2.223-.084A4.926 4.926 0 0 1 .96 9.167v-.062a4.887 4.887 0 0 0 2.235.616A4.928 4.928 0 0 1 1.67 3.148 13.98 13.98 0 0 0 11.82 8.292a4.929 4.929 0 0 1 8.39-4.49 9.868 9.868 0 0 0 3.128-1.196 4.941 4.941 0 0 1-2.165 2.724A9.828 9.828 0 0 0 24 4.555a10.019 10.019 0 0 1-2.457 2.549z"/></svg>'
  );
  background-image: url("data:image/svg+xml,@{svg}");
}
```

#### `<img>` elements

Theming an inline image is similar, but we use `content` to cover up the original image with our new one. You only need to update the SVG inside of the `escape('')` and you're all set.

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

&nbsp;

### How do I set a variable to RGB values?

You can use the following snippet to get the raw RGB values from a color.

```less
#rgbify(@color) {
  @rgb-raw: red(@color), green(@color), blue(@color);
}

--ctp-base: #rgbify(@base) []; // -> 30, 30, 46
```

### How can I inspect hard-to-grab elements?

Paste the following snippet into your browser console, then trigger the event. Adjust the delay (in milliseconds) as needed.

```js
setTimeout(function () {
  debugger;
}, 3000);
```

![](https://i0.wp.com/css-tricks.com/wp-content/uploads/2017/02/debugger.gif?ssl=1)

<span>Gif via <a href="https://css-tricks.com/set-timed-debugger-web-inspect-hard-grab-elements/">"Set a Timed Debugger To Web Inspect Hard-To-Grab Elements" - CSS Tricks</a>.</span>
