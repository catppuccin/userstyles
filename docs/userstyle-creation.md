# Userstyle Creation

> [!IMPORTANT]
> Websites should be popular or otherwise commonly known by members of the Catppuccin community; personal or niche sites may not meet the criteria. If you are unsure if a website qualifies, consider creating a [discussion](https://github.com/catppuccin/catppuccin/discussions/new?category=port-requests) before submitting an initial PR.

To create a userstyle, follow the instructions below. If you are unsure how to theme something, see [Guide](./guide/README.md). If you run into any difficulties or have any questions, feel free to join the [Catppuccin Discord server](https://discord.com/servers/catppuccin-907385605422448742) and find us in the #userstyles channel!

1. Fork the `catppuccin/userstyles` repository.
2. Create a new branch under the name `feat/<name-of-website>`, (e.g. `feat/nixos-search` instead of NixOS Search).
3. Create a new folder `styles/<name-of-website>`. The name must be `lower-kebab-case`.
4. Copy the contents of the [`template`](../template/) folder into `styles/<name-of-website>`.
   - **The template uses [LESS](https://lesscss.org/#overview), a preprocessor for Stylus. Please do not change this as we will only accept userstyles based on the template.**
5. [Write the userstyle](./tutorials/writing-a-userstyle.md).
6. [Edit the `userstyles.yml` file](./userstylesyml.md) and enter the details of your port.
7. Raise a [pull request](https://github.com/catppuccin/userstyles/compare), making sure to read and fill out the template properly. The title of your pull request should follow the format of `feat(<name-of-website>): init`.
