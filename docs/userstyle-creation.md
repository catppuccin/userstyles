<p align="center">
  <h2 align="center">🎨 Userstyle Creation</h2>
</p>

<p align="center">
	Guidelines for requesting and creating userstyles.
</p>

&nbsp;

### Table of Contents

<!--toc:start-->

- [Requesting Userstyles](#requesting-userstyles)
- [Creating Userstyles](#creating-userstyles)
<!--toc:end-->

### Requesting Userstyles

To request a website to be themed, please create a [Port Request](https://github.com/catppuccin/catppuccin/discussions/new?category=port-requests) discussion on [catppuccin/catppuccin](https://github.com/catppuccin/catppuccin). While this may seem odd, this ensures to keep all of our requests in one place and makes it easier for all people to request what they want without needing to learn what "Stylus" exactly is.

**If you have already created a userstyle, please raise a
[Pull Request](https://github.com/catppuccin/userstyles/compare)!**

&nbsp;

### Creating Userstyles

To create a userstyle, follow the instructions listed below:

1. Fork this repository.
2. Create a new branch under the name `feat/<name-of-website>`, (e.g.
   `feat/nixos-search` instead of NixOS Search).
3. Create a new folder `styles/<name-of-website>`. The name must be
   `lower-kebab-case`.
4. Copy the contents of the [`template`](../template/) folder into
   `styles/<name-of-website>`.
   - **The template uses [LESS](https://lesscss.org/#overview), a
     preprocessor for Stylus. Please do not change this as we will only accept
     userstyles based on the template.**
5. [Write the userstyle](./how-to-write-a-userstyle.md).
6. Edit the [`userstyles.yml`](../scripts/userstyles.yml) file and put in the details
   of your port. **More details given in [`userstylesyml.md`](./userstylesyml.md).**
7. Create your image preview.
   - Take a screenshot of the themed website in each flavor, and then convert all four images [to WebP](./tips-and-tricks.md#how-do-i-convert-preview-images-to-webp) (e.g. `mocha.webp`,
     `macchiato.webp`, `frappe.webp` & `latte.webp`).
   - Use [Catwalk](https://github.com/catppuccin/toolbox#catwalk) to generate a
     composite or grid image of all the images. **This must be saved as
     `styles/<name-of-website>/preview.webp`.**
8. Raise a [pull request](https://github.com/catppuccin/userstyles/compare),
   making sure to read and fill out the template properly. The title of your pull request should follow the format of `feat(<port-name>): init`.
