<h3 align="center">
	<img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/logos/exports/1544x1544_circle.png" width="100" alt="Logo"/><br/>
	<img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/misc/transparent.png" height="30" width="0px"/>
	Catppuccin for <a href="https://music.youtube.com">Youtube Music</a>
	<img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/misc/transparent.png" height="30" width="0px"/>
</h3>

<p align="center">
	<a href="https://github.com/catppuccin/youtubemusic/stargazers"><img src="https://img.shields.io/github/stars/catppuccin/youtubemusic?colorA=363a4f&colorB=b7bdf8&style=for-the-badge"></a>
	<a href="https://github.com/catppuccin/youtubemusic/issues"><img src="https://img.shields.io/github/issues/catppuccin/youtubemusic?colorA=363a4f&colorB=f5a97f&style=for-the-badge"></a>
	<a href="https://github.com/catppuccin/youtubemusic/contributors"><img src="https://img.shields.io/github/contributors/catppuccin/youtubemusic?colorA=363a4f&colorB=a6da95&style=for-the-badge"></a>
</p>

<p align="center">
  <img src="assets/res.webp"/>
</p>

## Previews

<details>
<summary>🌻 Latte</summary>
<img src="assets/latte.png"/>
</details>
<details>
<summary>🪴 Frappé</summary>
<img src="assets/frappe.png"/>
</details>
<details>
<summary>🌺 Macchiato</summary>
<img src="assets/macchiato.png"/>
</details>
<details>
<summary>🌿 Mocha</summary>
<img src="assets/mocha.png"/>
</details>

## Usage
### [Youtube Music Desktop App (th-ch)](https://github.com/th-ch/youtube-music)

1. Create a new css file with one of the flavour imports below.
2. Assuming you have the latest build with the theme selection menu, open the app, click `Options > Visual Tweaks > Theme > Import custom CSS file`, and choose the CSS file.

### [Youtube Music Desktop App (ytmdesktop)](https://github.com/ytmdesktop/ytmdesktop)

1. Navigate to the settings of the Youtube Music Desktop App.
2. Go to the appearances tab and turn on custom theme.
3. Click on the pencil icon to open up the editor window.
4. Paste in the flavour import for your flavour and press the save button.

### The code

```css
/* latte */
@import url("https://catppuccin.github.io/youtubemusic/src/latte.css");
/* frappe */
@import url("https://catppuccin.github.io/youtubemusic/src/frappe.css");
/* macchiato */
@import url("https://catppuccin.github.io/youtubemusic/src/macchiato.css");
/* mocha */
@import url("https://catppuccin.github.io/youtubemusic/src/mocha.css");

/* if you want to change the accent color, paste this in aswell and change the hex code - or use one of the predefined colors with var(--ctp-'color') - e.g. var(--ctp-maroon) */
html:not(.style-scope) {
    --ctp-accent: #f5e0dc !important;
}
```

### [Stylus](https://github.com/openstyles/stylus)

1. Install Stylus extension for [Firefox](https://addons.mozilla.org/en-US/firefox/addon/styl-us/), [Chrome](https://chrome.google.com/webstore/detail/stylus/clngdbkpkpeebahjckkjfobafhncgmne) or [Opera](https://addons.opera.com/en-gb/extensions/details/stylus/)
2. Then install with Stylus (click on the link):
  - [🎧 Catppuccin for Youtube Music](https://github.com/catppuccin/youtubemusic/raw/main/src/youtubemusic.user.css)
3. Choose your flavor and accent color in the Configure window in Stylus Options

### Overriding Colors

If you wish to change the default colors, do the following:

#### For [Youtube Music Desktop App (th-ch)](https://github.com/th-ch/youtube-music)

Change the respective colors in the css file you chose to the values you need, for example:

```css
    --ctp-base: #020202;
    --ctp-crust: #010101;
    --ctp-mantle: #000;
/* OLEDpuccin*/
```

#### For [Youtube Music Desktop App (ytmdesktop)](https://github.com/ytmdesktop/ytmdesktop) or Stylus

Paste the modified colors at the end of your theme of choice (ytmdesktop), or within `html:not(.style-scope)` (Stylus):

```css
    --ctp-base: #020202; !important;
    --ctp-crust: #010101; !important;
    --ctp-mantle: #000; !important;
/* OLEDpuccin */
```

You can find the references to the available colors you can change in the beginning of any theme CSS file.

## 💝 Thanks to

### Current maintainer

- [kerichdev](https://github.com/kerichdev)

### Contributions

- [Anubis](https://github.com/anubisnekhet)
- [OceanicSquirrel](https://github.com/OceanicSquirrel)

### Previous maintainer

- [rubyowo](https://github.com/rubyowo)

&nbsp;

<p align="center">
	<img src="https://raw.githubusercontent.com/catppuccin/catppuccin/main/assets/footers/gray0_ctp_on_line.svg?sanitize=true" />
</p>

<p align="center">
	Copyright &copy; 2021-present <a href="https://github.com/catppuccin" target="_blank">Catppuccin Org</a>
</p>

<p align="center">
	<a href="https://github.com/catppuccin/catppuccin/blob/main/LICENSE"><img src="https://img.shields.io/static/v1.svg?style=for-the-badge&label=License&message=MIT&logoColor=d9e0ee&colorA=363a4f&colorB=b7bdf8"/></a>
</p>
