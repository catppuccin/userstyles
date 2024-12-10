You can use the following snippet to get the raw RGB values from a color.

```less
#rgbify(@color) {
  @rgb-raw: red(@color), green(@color), blue(@color);
}

--ctp-base: #rgbify(@base) []; // -> 30, 30, 46
```
