<p align="center">
  <h2 align="center">📖 <code>userstyles.yml</code></h2>
</p>

<p align="center">
	The <a href="../scripts/userstyles.yml"><code>userstyles.yml</code></a> file is responsible for tracking all information about each userstyle.
</p>

&nbsp;

### Table of Contents

<!--toc:start-->

- [Adding a new userstyle](#adding-a-new-userstyle)
- [Adding yourself as a maintainer](#adding-yourself-as-a-maintainer)
- [Removing yourself as a maintainer](#removing-yourself-as-a-maintainer)
<!--toc:end-->

### Adding a new userstyle

[`userstyles.schema.json`](../scripts/userstyles.schema.json) is the schema
specification for `userstyles.yml`. The properties in the following instructions are based
on the schema. Please refer to it for clarification.

1. See [Adding yourself as a maintainer](#adding-yourself-as-a-maintainer).

2. Locate the `userstyles` section and add your port to the list, following the
   existing alphabetical order.

   You should make changes to everything wrapped in `<>` and remove the `<>`
   characters. If you need help with any of the fields, refer to
   other ports in the `userstyles.yml` file. If you would like extra guidance,
   you can ask for help in the pull request or join our
   [Discord](https://discord.com/servers/catppuccin-907385605422448742).

   `Required Fields:`

   ```yaml
   <port>:
     name: <name>
     # Up to 3 categories are allowed, and having at least one is required.
     # The first category is considered the "primary" category and impacts where the userstyle appears on the README.
     categories: [<primary-category>]
     color: <color>
     readme:
       app-link: <url>
       current-maintainers: [*<github-username>]
   ```

   `All Fields:`

   These extra `usage` & `faq` keys will ensure that you can add important
   information about the port to the README.

   The `icon` key is best explained the schema specification itself.

   The `past-maintainers` key is a list of people who have maintained the port
   in the past. We encourage all maintainers to add/remove themselves from this
   list as they see fit.

   Remember that these 5 fields are **optional**.

   ```yaml
   <port>:
     name: <name>
     categories: [<primary-category>, <optional-secondary-category>, <optional-third-category>]
     color: <color>
     icon: <icon>                                    # OPTIONAL
     readme:
       app-link: "<url>"
       usage: |+                                     # OPTIONAL
         > [!NOTE]
         > <your notes>
       faq:                                          # OPTIONAL
         - question: <question>
           answer: <answer>
       current-maintainers: [*<github-username>]
       past-maintainers: [*<github-username>]        # OPTIONAL
   ```

### Adding yourself as a maintainer

To add yourself as a maintainer, you need to add your GitHub username to the
`collaborators` array in the `userstyles.yml` file. This file is located in the
`scripts` directory. The `collaborators` array, is an array of objects, each
object should contain a `name` and a `url` key. And optionally a `name` key,
which is your preferred name.

```yaml
collaborators:
  - &<github-username>
    name: <preferred-name> # OPTIONAL
    url: https://github.com/<github-username>
```

Then you need to add your username to the `current-maintainers` array in for the
userstyle you want to maintain, in this case `youtube`.

```yaml
userstyles:
  youtube:
    name: YouTube
    categories: [entertainment, social_networking, photo_and_video]
    icon: youtube
    color: red
    readme:
      app-link: "https://youtube.com"
      current-maintainers: [*isabelroses, *your-username]
      past-maintainers: [*elkrien]
```

If the change is accepted, you will receive an invitation to the `catppuccin` organization,
and become a member of the [`userstyles-maintainers` team](https://github.com/orgs/catppuccin/teams/userstyles-maintainers).
As a maintainer you will be expected to:

- Review and merge PRs for the userstyle you maintain.
- Keep the userstyle up to date with the latest changes. If you no longer wish to maintain a userstyle, see [Removing yourself as a maintainer](#removing-yourself-as-a-maintainer).
- Follow our code of conduct and guidelines.

### Removing yourself as a maintainer

To remove yourself as a maintainer, you will need to move your username from the
`current-maintainers` array to the `past-maintainers` array for each of the userstyles you no longer wish to maintain. In the example for YouTube below, the user `elkrien` has been moved from the `current-maintainers` array to the `past-maintainers` array.

```diff
userstyles:
  youtube:
    name: YouTube
    categories: [entertainment, social_networking, photo_and_video]
    icon: youtube
    color: red
    readme:
      app-link: "https://youtube.com"
-     current-maintainers: [*isabelroses, *elkrien]
-     past-maintainers: []
+     current-maintainers: [*isabelroses]
+     past-maintainers: [*elkrien]

If you would not like to be listed as a past maintainer, you can remove yourself from
`collaborators` array entirely. Upon removal, you will also be removed from the
`userstyles-maintainers` team.
```
