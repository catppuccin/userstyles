## Requesting a new port

1. Create a new discussion with the [port request](https://github.com/catppuccin/catppuccin/discussions/new?category=port-requests) template.
2. Fill out the discussion template with the details of the website you want to port.
3. How the website can be themed.
4. If you have made the port yourself, you can add a link to your fork.

## Creating a new port

1. Fork this repository and clone your fork.
2. Create a new folder in the `styles` directory with the name of the website you are porting. The name must be `lower-kebab-case` (e.g. `nixos-search` instead of NixOS Search).
3. Copy the contents [`template`](../styles/template/) folder into the new folder you created.
4. Edit the `catppuccin.user.css` file and replace all the words wrapped with `<>` to fit the details of your port.
5. Edit the `userstyle.yml` file (located in the src folder) and put in the details of your port.
6. Create your previews in a folder called `assets/`
  - All previews **must** be `.webp` files.
  - create a preview image for each flavor and save the preview as `flavor.webp` where the word flavor is the name of the flavor.
  - use [catwalk](https://github.com/catppuccin/toolbox#catwalk) to generate a composite or grid image of all the flavors save this file as `catwalk.webp`.
7. Create a [port request](https://github.com/catppuccin/catppuccin/discussions/new?category=port-requests) disscussion and link to your forked repo.
8. Create a Pull Request to this repo from your fork, and link this in the discussion

### userstyle.yml

1. Add your name to the list of maintainers.
```yaml
maintainers:
  - &<your github username in lower case>
  name: <your name, this is optional>
  url: https://github.com/<your github username>
```

2. locate the `userstyles` section and add your port to the list.
```yaml
<port>:
  name: <name>
  category: <category>
  color: <color>
  icon: <icon>
  readme:
    app-link: "<url>"
    usage: |+
      > **Note** <br>
      > <your notes>
    faq:
      - question: <question>
        answer: <answer>
    maintainers: [ *<your github username> ]
```

You should make changes to everything wrapped in `<>` and remove the `<>` characters. If you need help with any of the fields, you should refer to other ports in the `userstyle.yml` file. If you still cannot figure it out, you can ask for help in the discussion you created or join the [discord server](https://discord.gg/catppuccin).

If you are unsure what category to put your port in, you can use the following list:
  - social
  - leisure
  - productivity
  - games
  - development
  - search_engine
  - messaging
