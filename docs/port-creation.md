## Requesting a new port

1. Create a new discussion with the [port request](https://github.com/catppuccin/catppuccin/discussions/new?category=port-requests) template.
2. Fill out the discussion template with the details of the program you want to port.
3. How the website can be themed.
4. If you have made the port yourself, you can add a link to your fork.

## Creating a new port

1. Fork this repository and clone your fork.
2. Create a new folder in the `styles` directory with the name of the program you are porting.
3. Copy the contents [`template`](../styles/template/) folder into the new folder you created.
4. Edit the `catppuccin.user.css` file and replace all the words wrapped with `<>` to fit the details of your port.
5. Edit the `userstyle.yml` file (located in the src folder) and put in the details of your port.
6. Create a [port request](https://github.com/catppuccin/catppuccin/discussions/new?category=port-requests) disscussion and link to your forked repo.

### userstyle.yml

1. Add your name to the list of maintainers.
```yaml
maintainers:
  - &<your name>
    url: https://github.com/<your name>
```
  replace `<your name>` with your github username.

2. locate the `userstyles` section and add your port to the list.
```yaml
name: <name>
category: <category>
color: <color>
icon: <icon>
readme:
  app-link: "<url>"
  usage: |+
    > **Note** <br>
    > <your notes>
  faq: <faq>
  maintainers: [ *<your name> ]
```
#### Name

This is the name of your port. It should be the same as the name of the folder you created.

#### Category

If you are unsure what category to put your port in, you can use the following list:
  - social
  - leisure
  - productivity
  - games
  - development
  - search_engine

#### Color (optional)

If you are unsure what color to put your port in, it should be the closest color to the main color of the program you are porting.

The following list is here to help you:
  - rosewater
  - flamingo
  - pink
  - mauve
  - red
  - maroon
  - peach
  - yellow
  - green
  - teal
  - sky
  - sapphire
  - blue
  - lavender
  - text

#### Icon (optional)

The icon to use on the website. This should be the same name as the SVG file on https://simpleicons.org/ (without the .svg extension).

#### Readme

##### App Link

This is the link to the program you are porting.

##### Usage (optional)

This is a short description of how to use your port. This should be in place of the `<your notes>` in the template.

##### FAQ (optional)

This is a short description of any frequently asked questions about your port.

##### Maintainers

This is a list of the maintainers of your port. You should add your github username to this list.
