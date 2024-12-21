## Obtaining RGB values

You can use the following snippet to get the raw RGB values from a color.

```less
#rgbify(@color) {
  @rgb: red(@color), green(@color), blue(@color);
}
```

```less
--ctp-base: #rgbify(@base) []; // -> 30, 30, 46
```

## Obtaining HSL values

You can use the following snippet to get the raw HSL values from a color.

```less
#hslify(@color) {
  @raw: e(
    %("%s, %s%, %s%", hue(@color), saturation(@color), lightness(@color))
  );
}
```

```less
--ctp-base: #hslify(@base) []; // -> 240, 21.052631578947366%, 14.901960784313726%
```
