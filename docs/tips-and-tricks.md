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
- [How do I theme code blocks / syntax highlighting?](#how-do-i-theme-code-blocks--syntax-highlighting)
<!--toc:end-->

### How do I theme websites that use CSS variables?

You're in luck! We have created a script that alleviates a lot of the pain associated with creating userstyles for websites that use CSS variables.

This script has 2 main functionalities:
- Obtain all CSS variables that the website uses
- Automatically converts said CSS variables to the nearest catppuccin colors using the [CIE Delta E 2000 Color-Difference Algorithm (CIEDE2000)](http://www.brucelindbloom.com/index.html?Eqn_DeltaE_CIE2000.html)

In both cases buttons on the page are created that when clicked, will copy the full CSS variable list to your clipboard so you can easily copy-paste it into stylus CSS LESS editor.

Here is the script (minified):

```javascript
const getAllCssVariables=()=>[...document.styleSheets].filter((({href:e})=>!e||e.startsWith(window.location.origin))).flatMap((({cssRules:e})=>[...e].filter((({type:e})=>1===e)).flatMap((({style:e})=>[...e].filter((e=>e.startsWith("--"))).map((t=>[t.trim(),e.getPropertyValue(t).trim()])))))),themeColors={mocha:[["rosewater","#f5e0dc"],["flamingo","#f2cdcd"],["pink","#f5c2e7"],["mauve","#cba6f7"],["red","#f38ba8"],["maroon","#eba0ac"],["peach","#fab387"],["yellow","#f9e2af"],["green","#a6e3a1"],["teal","#94e2d5"],["sky","#89dceb"],["sapphire","#74c7ec"],["blue","#89b4fa"],["lavender","#b4befe"],["text","#cdd6f4"],["subtext1","#bac2de"],["subtext0","#a6adc8"],["overlay2","#9399b2"],["overlay1","#7f849c"],["overlay0","#6c7086"],["surface2","#585b70"],["surface1","#45475a"],["surface0","#313244"],["base","#1e1e2e"],["mantle","#181825"],["crust","#11111b"]],latte:[["rosewater","#dc8a78"],["flamingo","#dd7878"],["pink","#ea76cb"],["mauve","#8839ef"],["red","#d20f39"],["maroon","#e64553"],["peach","#fe640b"],["yellow","#df8e1d"],["green","#40a02b"],["teal","#179299"],["sky","#04a5e5"],["sapphire","#209fb5"],["blue","#1e66f5"],["lavender","#7287fd"],["text","#4c4f69"],["subtext1","#5c5f77"],["subtext0","#6c6f85"],["overlay2","#7c7f93"],["overlay1","#8c8fa1"],["overlay0","#9ca0b0"],["surface2","#acb0be"],["surface1","#bcc0cc"],["surface0","#ccd0da"],["base","#eff1f5"],["mantle","#e6e9ef"],["crust","#dce0e8"]]},isHex=e=>/^#([0-9a-f]{3,4}|[0-9a-f]{6,8})$/i.test(e),isRgb=e=>(e.startsWith("rgb(")||e.startsWith("rgba("))&&e.endsWith(")"),parseRgb=e=>{const[t,a,r,s=1]=e.replace(/rgba?\((.*?)\)/,"$1").split(",").map(((e,t)=>t<3&&e.includes("%")?255*parseFloat(e)/100:+e));return{r:t,g:a,b:r,opacity:s}},rgb2lab=({r:e,g:t,b:a})=>{let r,s,o,c=e/255,l=t/255,n=a/255;return c=c>.04045?Math.pow((c+.055)/1.055,2.4):c/12.92,l=l>.04045?Math.pow((l+.055)/1.055,2.4):l/12.92,n=n>.04045?Math.pow((n+.055)/1.055,2.4):n/12.92,r=(.4124*c+.3576*l+.1805*n)/.95047,s=(.2126*c+.7152*l+.0722*n)/1,o=(.0193*c+.1192*l+.9505*n)/1.08883,r=r>.008856?Math.pow(r,1/3):7.787*r+16/116,s=s>.008856?Math.pow(s,1/3):7.787*s+16/116,o=o>.008856?Math.pow(o,1/3):7.787*o+16/116,[116*s-16,500*(r-s),200*(s-o)]},getDe2000DistanceBetweenTwoColors=(e,t,a,r,s,o)=>{Math.rad2deg=function(e){return 360*e/(2*Math.PI)},Math.deg2rad=function(e){return 2*Math.PI*e/360};const c=(e+r)/2,l=(Math.sqrt(Math.pow(t,2)+Math.pow(a,2))+Math.sqrt(Math.pow(s,2)+Math.pow(o,2)))/2,n=(1-Math.sqrt(Math.pow(l,7)/(Math.pow(l,7)+Math.pow(25,7))))/2,i=t*(1+n),h=s*(1+n),d=Math.sqrt(Math.pow(i,2)+Math.pow(a,2)),b=Math.sqrt(Math.pow(h,2)+Math.pow(o,2)),p=(d+b)/2;let g=Math.rad2deg(Math.atan2(a,i));g<0&&(g+=360);let M=Math.rad2deg(Math.atan2(o,h));M<0&&(M+=360);const f=Math.abs(g-M)>180?(g+M+360)/2:(g+M)/2,u=1-.17*Math.cos(Math.deg2rad(f-30))+.24*Math.cos(Math.deg2rad(2*f))+.32*Math.cos(Math.deg2rad(3*f+6))-.2*Math.cos(Math.deg2rad(4*f-63));let w=M-g;Math.abs(w)>180&&(M<=g?w+=360:w-=360);const m=r-e,C=b-d;w=2*Math.sqrt(d*b)*Math.sin(Math.deg2rad(w)/2);const y=1+.015*Math.pow(c-50,2)/Math.sqrt(20+Math.pow(c-50,2)),V=1+.045*p,v=1+.015*p*u,k=30*Math.exp(-Math.pow((f-275)/25,2)),x=-(2*Math.sqrt(Math.pow(p,7)/(Math.pow(p,7)+Math.pow(25,7))))*Math.sin(2*Math.deg2rad(k));return Math.sqrt(Math.pow(m/(1*y),2)+Math.pow(C/(1*V),2)+Math.pow(w/(1*v),2)+x*(C/(1*V))*(w/(1*v)))},parseHex=e=>{const t=e.length<=5,[a,r,s,o=255]=t?e.slice(1).match(/./g).map((e=>parseInt(e+e,16))):e.slice(1).match(/.{2}/g).map((e=>parseInt(e,16)));return{r:a,g:r,b:s,opacity:o/255}},closestColor=(e,t)=>{const a=t.map((([t,a])=>[t,getDe2000DistanceBetweenTwoColors(...rgb2lab(e),...rgb2lab(parseHex(a)))])),[r]=a.reduce(((e,t)=>t[1]<e[1]?t:e));return`@${r}`},isVar=e=>e.startsWith("var(")&&e.endsWith(")"),parseCssVariableValue=e=>isHex(e)?parseHex(e):isRgb(e)?parseRgb(e):!!isVar(e)&&parseVar(e),parseVar=e=>{const t=getAllCssVariables().find((([t])=>t===e.slice(4,-1)));return!!t&&parseCssVariableValue(t[1])},newCssVariables=e=>getAllCssVariables().flatMap((([t,a])=>{const r=parseCssVariableValue(a);if(r){const a=closestColor(r,e);return[[t,1===r.opacity?a:`fade(${a}, ${Math.round(100*r.opacity)}%)`]]}return[]})),getNewTheme=e=>newCssVariables(e).map((([e,t])=>`${e}: ${t};`)).join("\n"),[lightModeString,darkModeString,allCssVariablesString]=[getNewTheme(themeColors.latte),getNewTheme(themeColors.mocha),getAllCssVariables().map((([e,t])=>`${e}: ${t};`)).join("\n")],createButton=(e,t,a,r,s)=>{const o=document.createElement("button");return Object.assign(o.style,{position:"absolute",zIndex:"10000000000",top:t,left:"2rem",width:"10rem",height:"10rem",backgroundColor:a,color:r}),o.textContent=e,o.addEventListener("click",s),document.body.appendChild(o),o},buttons=[createButton("LIGHT - Click if the script was run while the website had a light theme","2rem","#cdd6f4","#1e1e2e",(()=>navigator.clipboard.writeText(lightModeString))),createButton("DARK - Click if the script was run while the website had a dark theme","14rem","#1e1e2e","#cdd6f4",(()=>navigator.clipboard.writeText(darkModeString))),createButton("ALL - Click to copy ALL CSS VARIABLES (unmodified)","26rem","#fab387","#11111b",(()=>navigator.clipboard.writeText(allCssVariablesString))),createButton("REMOVE BUTTONS","38rem","#eba0ac","#11111b",(()=>buttons.forEach((e=>document.body.removeChild(e)))))];scrollTo({top:0}),console.log("%c Success!","background:#a6e3a1;color:#1e1e2e;font-weight:bold;font-size:1.6rem;padding:0.2rem;"),console.log(`%c I was able to convert ${newCssVariables(themeColors.latte).length} / ${getAllCssVariables().length} css variables from this site to Catppuccin theme.`,"color:#89dceb;background:#1e1e2e;font-size:1.2rem;"),console.log('%c If this website had a light theme **when you ran this script**, click on the "LIGHT" button. \nElse click on the "DARK" button (otherwise the colors will be wrong)',"color:#cdd6f4;background:#1e1e2e;font-size:1.2rem;");
```

[If you would like to see the non-minified version](../scripts/css-variable-generator.js)

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

#### SVGs as `background-image`s

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

#### `<img>` elements

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

&nbsp;

### How do I set a variable to RGB values?

You can use the following snippet to get the raw RGB values from a color.

```less
#rgbify(@color) {
  @rgb-raw: red(@color), green(@color), blue(@color);
}

--ctp-base: #rgbify(@base) []; // -> 30, 30, 46
```

&nbsp;

### How can I inspect hard-to-grab elements?

Paste the following snippet into your browser console, then trigger the event. Adjust the delay (in milliseconds) as needed.

```js
setTimeout(function () {
  debugger;
}, 3000);
```

![](https://i0.wp.com/css-tricks.com/wp-content/uploads/2017/02/debugger.gif?ssl=1)

GIF via ["Set a Timed Debugger To Web Inspect Hard-To-Grab Elements" - CSS Tricks](https://css-tricks.com/set-timed-debugger-web-inspect-hard-grab-elements/).

&nbsp;

### How do I theme code blocks / syntax highlighting?

If a website uses [highlight.js](https://highlightjs.org/) or [Pygments](https://pygments.org/) for syntax highlighting, follow the steps for the syntax higlighter in use below.

#### highlight.js

Add the following line at the top of the userstyle, beneath the `@-moz-document` line.

```css
@import url("https://unpkg.com/@catppuccin/highlightjs@0.2.2/css/catppuccin.variables.important.css");
```

Then add the following lines beneath the color definition section (`@<color>: @catppuccin[@@lookup][@<color>];`) in the `#catppuccin` mixin:

```css
--ctp-rosewater: #rgbify(@rosewater) [];
--ctp-flamingo: #rgbify(@flamingo) [];
--ctp-pink: #rgbify(@pink) [];
--ctp-mauve: #rgbify(@mauve) [];
--ctp-red: #rgbify(@red) [];
--ctp-maroon: #rgbify(@maroon) [];
--ctp-peach: #rgbify(@peach) [];
--ctp-yellow: #rgbify(@yellow) [];
--ctp-green: #rgbify(@green) [];
--ctp-teal: #rgbify(@teal) [];
--ctp-sky: #rgbify(@sky) [];
--ctp-sapphire: #rgbify(@sapphire) [];
--ctp-blue: #rgbify(@blue) [];
--ctp-lavender: #rgbify(@lavender) [];
--ctp-text: #rgbify(@text) [];
--ctp-subtext1: #rgbify(@subtext1) [];
--ctp-subtext0: #rgbify(@subtext0) [];
--ctp-overlay2: #rgbify(@overlay2) [];
--ctp-overlay1: #rgbify(@overlay1) [];
--ctp-overlay0: #rgbify(@overlay0) [];
--ctp-surface2: #rgbify(@surface2) [];
--ctp-surface1: #rgbify(@surface1) [];
--ctp-surface0: #rgbify(@surface0) [];
--ctp-base: #rgbify(@base) [];
--ctp-mantle: #rgbify(@mantle) [];
--ctp-crust: #rgbify(@crust) [];
```

Finally, add the [`#rbgify` mixin](#how-do-i-set-a-variable-to-rgb-values) above the `@catppuccin` color palette at the bottom of the userstyle.

#### Pygments

Add the following line at the top of the userstyle, beneath the `@-moz-document` line.

```css
@import url("https://python.catppuccin.com/pygments/catppuccin-variables.important.css");
```

You'll also need to add the following lines beneath the color definition section (`@<color>: @catppuccin[@@lookup][@<color>];`) in the `#catppuccin` mixin:

```css
--ctp-rosewater: @rosewater;
--ctp-flamingo: @flamingo;
--ctp-pink: @pink;
--ctp-mauve: @mauve;
--ctp-red: @red;
--ctp-maroon: @maroon;
--ctp-peach: @peach;
--ctp-yellow: @yellow;
--ctp-green: @green;
--ctp-teal: @teal;
--ctp-sky: @sky;
--ctp-sapphire: @sapphire;
--ctp-blue: @blue;
--ctp-lavender: @lavender;
--ctp-text: @text;
--ctp-subtext1: @subtext1;
--ctp-subtext0: @subtext0;
--ctp-overlay2: @overlay2;
--ctp-overlay1: @overlay1;
--ctp-overlay0: @overlay0;
--ctp-surface2: @surface2;
--ctp-surface1: @surface1;
--ctp-surface0: @surface0;
--ctp-base: @base;
--ctp-mantle: @mantle;
--ctp-crust: @crust;
```
