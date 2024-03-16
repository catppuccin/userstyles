<p align="center">
  <h2 align="center">📖 Userstyle Creation</h2>
</p>

<p align="center">
	A guide to all things [`userstyles.yml`](../scripts/userstyles.yml).
</p>

&nbsp;

### Table of Contents

<!--toc:start-->
- [Table of Contents](#table-of-contents)
- [Adding yourself as a maintainer](#adding-yourself-as-a-maintainer)
- [Removing yourself as a maintainer](#removing-yourself-as-a-maintainer)
<!--toc:end-->

### Adding yourself as a maintainer

To add yourself as a maintainer, you need to add your GitHub username to the
`maintainers` array in the `userstyles.yml` file. This file is located in the
`scripts` directory. The `maintainers` array, is an array of objects, each
object should contain a `name` and a `url` key. And optionally a `name` key,
which is your preferred name.

```yaml
maintainers:
  - &your-username
    name: Your Prefered Name
    url: https://github.com/your-username
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
      current-maintainers: [*isabelroses *your-username]
      past-maintainers: [*elkrien]
```

### Removing yourself as a maintainer

To remove yourself as a maintainer, you need to remove your username from the
`current-maintainers` array for the userstyles you wish to no longer maintain,
and add yourself to the `past-maintainers` array. In the example of youtube
below, `elkrien` has been removed from the `current-maintainers` array and added
to the `past-maintainers` array.

```yaml
userstyles:
  youtube:
    name: YouTube
    categories: [entertainment, social_networking, photo_and_video]
    icon: youtube
    color: red
    readme:
      app-link: "https://youtube.com"
      current-maintainers: [*isabelroses]
      past-maintainers: [*elkrien]
```

If you prefer not to be listed as a past maintainer, you can remove yourself for
maintainers array entirely.
