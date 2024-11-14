The Catppuccin project prefers to use the [WebP image format](https://en.wikipedia.org/wiki/WebP) for the asset preview images. We recommend using Google's [`cwebp`](https://developers.google.com/speed/webp/docs/cwebp) conversion utility to convert images to WebP.

## Installation

| Method                                | Instructions                                                                             |
| ------------------------------------- | ---------------------------------------------------------------------------------------- |
| [Homebrew](https://brew.sh/)          | `brew install webp` [[view cask]](https://formulae.brew.sh/formula/webp)                 |
| [MacPorts](https://www.macports.org/) | `sudo port install webp` [[view port]](https://ports.macports.org/port/webp/)            |
| Binaries                              | See <https://storage.googleapis.com/downloads.webmproject.org/releases/webp/index.html>. |

## Usage

> [!TIP]
> See [the full documentation on `cwebp`](https://developers.google.com/speed/webp/docs/cwebp) for further reference.

```
cwebp -lossless old-image.png -o new-image.webp
```

The command above is converting the input image `old-image.png` to the output file `new-image-webp`, with a lossless quality conversion.
