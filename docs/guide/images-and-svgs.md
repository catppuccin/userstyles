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

If you encounter non-SVG images, or many `<img>` elements with external SVGs, the best approach is to apply a CSS color filter to the images. Start by adding the following specially generated filters palette block to the bottom of the userstyle, below the existing `@catppuccin` palette block.

```css
/* deno-fmt-ignore */
@catppuccin-filters: {
  @latte: { @rosewater: brightness(0) saturate(100%) invert(65%) sepia(18%) saturate(1048%) hue-rotate(323deg) brightness(92%) contrast(86%); @flamingo: brightness(0) saturate(100%) invert(84%) sepia(44%) saturate(4533%) hue-rotate(310deg) brightness(98%) contrast(75%); @pink: brightness(0) saturate(100%) invert(60%) sepia(32%) saturate(775%) hue-rotate(266deg) brightness(93%) contrast(97%); @mauve: brightness(0) saturate(100%) invert(26%) sepia(59%) saturate(3315%) hue-rotate(255deg) brightness(94%) contrast(100%); @red: brightness(0) saturate(100%) invert(16%) sepia(78%) saturate(7275%) hue-rotate(342deg) brightness(84%) contrast(94%); @maroon: brightness(0) saturate(100%) invert(31%) sepia(56%) saturate(2395%) hue-rotate(331deg) brightness(99%) contrast(82%); @peach: brightness(0) saturate(100%) invert(38%) sepia(81%) saturate(1292%) hue-rotate(356deg) brightness(103%) contrast(99%); @yellow: brightness(0) saturate(100%) invert(74%) sepia(47%) saturate(4570%) hue-rotate(354deg) brightness(95%) contrast(83%); @green: brightness(0) saturate(100%) invert(51%) sepia(25%) saturate(4134%) hue-rotate(76deg) brightness(95%) contrast(66%); @teal: brightness(0) saturate(100%) invert(41%) sepia(45%) saturate(1101%) hue-rotate(139deg) brightness(100%) contrast(82%); @sky: brightness(0) saturate(100%) invert(47%) sepia(76%) saturate(2427%) hue-rotate(166deg) brightness(99%) contrast(97%); @sapphire: brightness(0) saturate(100%) invert(52%) sepia(41%) saturate(6982%) hue-rotate(160deg) brightness(102%) contrast(75%); @blue: brightness(0) saturate(100%) invert(30%) sepia(80%) saturate(1850%) hue-rotate(209deg) brightness(94%) contrast(105%); @lavender: brightness(0) saturate(100%) invert(48%) sepia(61%) saturate(538%) hue-rotate(194deg) brightness(102%) contrast(98%); @text: brightness(0) saturate(100%) invert(30%) sepia(10%) saturate(1259%) hue-rotate(196deg) brightness(97%) contrast(91%); @subtext1: brightness(0) saturate(100%) invert(36%) sepia(10%) saturate(890%) hue-rotate(196deg) brightness(98%) contrast(90%); @subtext0: brightness(0) saturate(100%) invert(47%) sepia(6%) saturate(1263%) hue-rotate(195deg) brightness(90%) contrast(81%); @overlay2: brightness(0) saturate(100%) invert(59%) sepia(7%) saturate(825%) hue-rotate(195deg) brightness(83%) contrast(91%); @overlay1: brightness(0) saturate(100%) invert(59%) sepia(14%) saturate(333%) hue-rotate(194deg) brightness(95%) contrast(89%); @overlay0: brightness(0) saturate(100%) invert(85%) sepia(7%) saturate(595%) hue-rotate(191deg) brightness(77%) contrast(81%); @surface2: brightness(0) saturate(100%) invert(86%) sepia(6%) saturate(482%) hue-rotate(189deg) brightness(82%) contrast(88%); @surface1: brightness(0) saturate(100%) invert(85%) sepia(8%) saturate(281%) hue-rotate(187deg) brightness(92%) contrast(88%); @surface0: brightness(0) saturate(100%) invert(96%) sepia(1%) saturate(5123%) hue-rotate(185deg) brightness(93%) contrast(83%); @base: brightness(0) saturate(100%) invert(89%) sepia(5%) saturate(140%) hue-rotate(182deg) brightness(109%) contrast(94%); @mantle: brightness(0) saturate(100%) invert(93%) sepia(19%) saturate(55%) hue-rotate(182deg) brightness(98%) contrast(92%); @crust: brightness(0) saturate(100%) invert(91%) sepia(1%) saturate(4489%) hue-rotate(196deg) brightness(106%) contrast(82%); };
  @frappe: { @rosewater: brightness(0) saturate(100%) invert(90%) sepia(6%) saturate(734%) hue-rotate(321deg) brightness(95%) contrast(99%); @flamingo: brightness(0) saturate(100%) invert(88%) sepia(52%) saturate(817%) hue-rotate(293deg) brightness(113%) contrast(84%); @pink: brightness(0) saturate(100%) invert(76%) sepia(15%) saturate(844%) hue-rotate(280deg) brightness(107%) contrast(91%); @mauve: brightness(0) saturate(100%) invert(71%) sepia(25%) saturate(725%) hue-rotate(225deg) brightness(94%) contrast(91%); @red: brightness(0) saturate(100%) invert(67%) sepia(3%) saturate(7209%) hue-rotate(305deg) brightness(91%) contrast(99%); @maroon: brightness(0) saturate(100%) invert(61%) sepia(14%) saturate(957%) hue-rotate(307deg) brightness(109%) contrast(90%); @peach: brightness(0) saturate(100%) invert(68%) sepia(28%) saturate(662%) hue-rotate(335deg) brightness(96%) contrast(94%); @yellow: brightness(0) saturate(100%) invert(94%) sepia(88%) saturate(684%) hue-rotate(309deg) brightness(105%) contrast(80%); @green: brightness(0) saturate(100%) invert(89%) sepia(23%) saturate(582%) hue-rotate(42deg) brightness(87%) contrast(89%); @teal: brightness(0) saturate(100%) invert(91%) sepia(13%) saturate(986%) hue-rotate(110deg) brightness(85%) contrast(81%); @sky: brightness(0) saturate(100%) invert(75%) sepia(15%) saturate(623%) hue-rotate(141deg) brightness(109%) contrast(81%); @sapphire: brightness(0) saturate(100%) invert(77%) sepia(20%) saturate(730%) hue-rotate(157deg) brightness(97%) contrast(76%); @blue: brightness(0) saturate(100%) invert(68%) sepia(16%) saturate(1070%) hue-rotate(185deg) brightness(96%) contrast(95%); @lavender: brightness(0) saturate(100%) invert(75%) sepia(20%) saturate(626%) hue-rotate(201deg) brightness(101%) contrast(89%); @text: brightness(0) saturate(100%) invert(83%) sepia(12%) saturate(582%) hue-rotate(191deg) brightness(98%) contrast(96%); @subtext1: brightness(0) saturate(100%) invert(80%) sepia(18%) saturate(411%) hue-rotate(190deg) brightness(96%) contrast(84%); @subtext0: brightness(0) saturate(100%) invert(82%) sepia(6%) saturate(1287%) hue-rotate(192deg) brightness(86%) contrast(85%); @overlay2: brightness(0) saturate(100%) invert(65%) sepia(36%) saturate(230%) hue-rotate(190deg) brightness(92%) contrast(82%); @overlay1: brightness(0) saturate(100%) invert(55%) sepia(12%) saturate(638%) hue-rotate(189deg) brightness(98%) contrast(87%); @overlay0: brightness(0) saturate(100%) invert(49%) sepia(13%) saturate(662%) hue-rotate(192deg) brightness(94%) contrast(84%); @surface2: brightness(0) saturate(100%) invert(41%) sepia(20%) saturate(469%) hue-rotate(191deg) brightness(93%) contrast(86%); @surface1: brightness(0) saturate(100%) invert(34%) sepia(14%) saturate(771%) hue-rotate(190deg) brightness(89%) contrast(85%); @surface0: brightness(0) saturate(100%) invert(28%) sepia(7%) saturate(1468%) hue-rotate(193deg) brightness(92%) contrast(95%); @base: brightness(0) saturate(100%) invert(20%) sepia(17%) saturate(747%) hue-rotate(192deg) brightness(96%) contrast(97%); @mantle: brightness(0) saturate(100%) invert(8%) sepia(7%) saturate(7271%) hue-rotate(198deg) brightness(88%) contrast(75%); @crust: brightness(0) saturate(100%) invert(7%) sepia(7%) saturate(7415%) hue-rotate(197deg) brightness(86%) contrast(79%); };
  @macchiato: { @rosewater: brightness(0) saturate(100%) invert(88%) sepia(13%) saturate(322%) hue-rotate(321deg) brightness(102%) contrast(91%); @flamingo: brightness(0) saturate(100%) invert(82%) sepia(3%) saturate(3070%) hue-rotate(314deg) brightness(107%) contrast(88%); @pink: brightness(0) saturate(100%) invert(80%) sepia(23%) saturate(509%) hue-rotate(280deg) brightness(102%) contrast(92%); @mauve: brightness(0) saturate(100%) invert(65%) sepia(18%) saturate(903%) hue-rotate(222deg) brightness(104%) contrast(93%); @red: brightness(0) saturate(100%) invert(61%) sepia(19%) saturate(1541%) hue-rotate(305deg) brightness(110%) contrast(86%); @maroon: brightness(0) saturate(100%) invert(71%) sepia(10%) saturate(1331%) hue-rotate(306deg) brightness(93%) contrast(101%); @peach: brightness(0) saturate(100%) invert(73%) sepia(13%) saturate(1676%) hue-rotate(330deg) brightness(103%) contrast(92%); @yellow: brightness(0) saturate(100%) invert(87%) sepia(89%) saturate(321%) hue-rotate(314deg) brightness(101%) contrast(87%); @green: brightness(0) saturate(100%) invert(93%) sepia(12%) saturate(1128%) hue-rotate(48deg) brightness(92%) contrast(85%); @teal: brightness(0) saturate(100%) invert(92%) sepia(10%) saturate(1176%) hue-rotate(110deg) brightness(87%) contrast(90%); @sky: brightness(0) saturate(100%) invert(78%) sepia(57%) saturate(230%) hue-rotate(142deg) brightness(96%) contrast(84%); @sapphire: brightness(0) saturate(100%) invert(74%) sepia(35%) saturate(438%) hue-rotate(156deg) brightness(92%) contrast(93%); @blue: brightness(0) saturate(100%) invert(67%) sepia(17%) saturate(1007%) hue-rotate(183deg) brightness(99%) contrast(94%); @lavender: brightness(0) saturate(100%) invert(74%) sepia(6%) saturate(2559%) hue-rotate(198deg) brightness(103%) contrast(94%); @text: brightness(0) saturate(100%) invert(81%) sepia(9%) saturate(726%) hue-rotate(192deg) brightness(104%) contrast(92%); @subtext1: brightness(0) saturate(100%) invert(84%) sepia(5%) saturate(1453%) hue-rotate(193deg) brightness(94%) contrast(86%); @subtext0: brightness(0) saturate(100%) invert(75%) sepia(18%) saturate(361%) hue-rotate(190deg) brightness(91%) contrast(86%); @overlay2: brightness(0) saturate(100%) invert(67%) sepia(9%) saturate(814%) hue-rotate(191deg) brightness(92%) contrast(88%); @overlay1: brightness(0) saturate(100%) invert(49%) sepia(38%) saturate(203%) hue-rotate(190deg) brightness(101%) contrast(93%); @overlay0: brightness(0) saturate(100%) invert(46%) sepia(16%) saturate(552%) hue-rotate(193deg) brightness(93%) contrast(84%); @surface2: brightness(0) saturate(100%) invert(34%) sepia(16%) saturate(611%) hue-rotate(192deg) brightness(101%) contrast(87%); @surface1: brightness(0) saturate(100%) invert(30%) sepia(11%) saturate(1085%) hue-rotate(194deg) brightness(92%) contrast(89%); @surface0: brightness(0) saturate(100%) invert(18%) sepia(21%) saturate(880%) hue-rotate(193deg) brightness(97%) contrast(84%); @base: brightness(0) saturate(100%) invert(12%) sepia(42%) saturate(570%) hue-rotate(194deg) brightness(90%) contrast(90%); @mantle: brightness(0) saturate(100%) invert(6%) sepia(6%) saturate(7499%) hue-rotate(200deg) brightness(93%) contrast(85%); @crust: brightness(0) saturate(100%) invert(5%) sepia(8%) saturate(5346%) hue-rotate(202deg) brightness(98%) contrast(88%); };
  @mocha: { @rosewater: brightness(0) saturate(100%) invert(92%) sepia(5%) saturate(704%) hue-rotate(320deg) brightness(99%) contrast(93%); @flamingo: brightness(0) saturate(100%) invert(81%) sepia(5%) saturate(987%) hue-rotate(315deg) brightness(107%) contrast(90%); @pink: brightness(0) saturate(100%) invert(86%) sepia(11%) saturate(1177%) hue-rotate(283deg) brightness(101%) contrast(92%); @mauve: brightness(0) saturate(100%) invert(65%) sepia(58%) saturate(255%) hue-rotate(224deg) brightness(96%) contrast(102%); @red: brightness(0) saturate(100%) invert(61%) sepia(19%) saturate(997%) hue-rotate(294deg) brightness(104%) contrast(91%); @maroon: brightness(0) saturate(100%) invert(66%) sepia(16%) saturate(1301%) hue-rotate(306deg) brightness(116%) contrast(84%); @peach: brightness(0) saturate(100%) invert(68%) sepia(57%) saturate(278%) hue-rotate(338deg) brightness(98%) contrast(101%); @yellow: brightness(0) saturate(100%) invert(90%) sepia(70%) saturate(380%) hue-rotate(313deg) brightness(102%) contrast(95%); @green: brightness(0) saturate(100%) invert(88%) sepia(6%) saturate(2015%) hue-rotate(63deg) brightness(104%) contrast(78%); @teal: brightness(0) saturate(100%) invert(92%) sepia(12%) saturate(991%) hue-rotate(108deg) brightness(93%) contrast(90%); @sky: brightness(0) saturate(100%) invert(84%) sepia(21%) saturate(1302%) hue-rotate(164deg) brightness(106%) contrast(84%); @sapphire: brightness(0) saturate(100%) invert(74%) sepia(20%) saturate(876%) hue-rotate(156deg) brightness(96%) contrast(93%); @blue: brightness(0) saturate(100%) invert(68%) sepia(18%) saturate(951%) hue-rotate(180deg) brightness(98%) contrast(100%); @lavender: brightness(0) saturate(100%) invert(73%) sepia(7%) saturate(1670%) hue-rotate(195deg) brightness(102%) contrast(99%); @text: brightness(0) saturate(100%) invert(86%) sepia(6%) saturate(879%) hue-rotate(190deg) brightness(100%) contrast(93%); @subtext1: brightness(0) saturate(100%) invert(84%) sepia(19%) saturate(381%) hue-rotate(193deg) brightness(91%) contrast(89%); @subtext0: brightness(0) saturate(100%) invert(84%) sepia(9%) saturate(767%) hue-rotate(192deg) brightness(84%) contrast(84%); @overlay2: brightness(0) saturate(100%) invert(63%) sepia(15%) saturate(428%) hue-rotate(191deg) brightness(96%) contrast(84%); @overlay1: brightness(0) saturate(100%) invert(56%) sepia(15%) saturate(455%) hue-rotate(192deg) brightness(90%) contrast(88%); @overlay0: brightness(0) saturate(100%) invert(44%) sepia(6%) saturate(1275%) hue-rotate(194deg) brightness(97%) contrast(88%); @surface2: brightness(0) saturate(100%) invert(34%) sepia(8%) saturate(1015%) hue-rotate(195deg) brightness(99%) contrast(89%); @surface1: brightness(0) saturate(100%) invert(25%) sepia(6%) saturate(1950%) hue-rotate(197deg) brightness(99%) contrast(86%); @surface0: brightness(0) saturate(100%) invert(19%) sepia(5%) saturate(2844%) hue-rotate(199deg) brightness(91%) contrast(93%); @base: brightness(0) saturate(100%) invert(7%) sepia(4%) saturate(7496%) hue-rotate(202deg) brightness(93%) contrast(87%); @mantle: brightness(0) saturate(100%) invert(6%) sepia(4%) saturate(7465%) hue-rotate(202deg) brightness(95%) contrast(90%); @crust: brightness(0) saturate(100%) invert(3%) sepia(13%) saturate(6863%) hue-rotate(220deg) brightness(95%) contrast(91%); };
}
```

Select the filter definitions from below that you plan to use and insert them near the top of the `#catppuccin` mixin, below the `@<color>: @catppuccin[@@lookup][@<color>];` color definitions.

```css
@rosewater-filter: @catppuccin-filters[@@lookup][@rosewater];
@flamingo-filter: @catppuccin-filters[@@lookup][@flamingo];
@pink-filter: @catppuccin-filters[@@lookup][@pink];
@mauve-filter: @catppuccin-filters[@@lookup][@mauve];
@red-filter: @catppuccin-filters[@@lookup][@red];
@maroon-filter: @catppuccin-filters[@@lookup][@maroon];
@peach-filter: @catppuccin-filters[@@lookup][@peach];
@yellow-filter: @catppuccin-filters[@@lookup][@yellow];
@green-filter: @catppuccin-filters[@@lookup][@green];
@teal-filter: @catppuccin-filters[@@lookup][@teal];
@sky-filter: @catppuccin-filters[@@lookup][@sky];
@sapphire-filter: @catppuccin-filters[@@lookup][@sapphire];
@blue-filter: @catppuccin-filters[@@lookup][@blue];
@lavender-filter: @catppuccin-filters[@@lookup][@lavender];
@text-filter: @catppuccin-filters[@@lookup][@text];
@subtext1-filter: @catppuccin-filters[@@lookup][@subtext1];
@subtext0-filter: @catppuccin-filters[@@lookup][@subtext0];
@overlay2-filter: @catppuccin-filters[@@lookup][@overlay2];
@overlay1-filter: @catppuccin-filters[@@lookup][@overlay1];
@overlay0-filter: @catppuccin-filters[@@lookup][@overlay0];
@surface2-filter: @catppuccin-filters[@@lookup][@surface2];
@surface1-filter: @catppuccin-filters[@@lookup][@surface1];
@surface0-filter: @catppuccin-filters[@@lookup][@surface0];
@base-filter: @catppuccin-filters[@@lookup][@base];
@mantle-filter: @catppuccin-filters[@@lookup][@mantle];
@crust-filter: @catppuccin-filters[@@lookup][@crust];
@accent-color-filter: @catppuccin-filters[@@lookup][@@accent];
```
