---
title: Library Modules
description: Reference for library modules.
sidebar:
  label: Overview
---

Library modules consist of collections of mixins which target design systems or commonly used libraries.

They follow a standard structure and should be built to be modular and reusable across several userstyles.

## Structure

The [standard library](/contributing/reference/libraries/standard/) is a good reference as to how libraries can be structured.

All libraries are in lib/ with subdirectories per library name, and versioned files (e.g., `v1.less`, `v2.less`, etc).

They must have a top level mixin in the format `#__libraryname`. All constants and variables should be under a nested `.base` mixin. The nested mixin is used like `#__libraryname.base()` after all other standard library statements.

Other mixins and constants may be included, but they must be under the top level mixin for scoping purposes.

## Creation

Identify what your library module will achieve. Are you targeting a design system, framework, or a library?

If a design system or framework, is it specific to one userstyle or reusable across multiple? What are the popularity metrics of it? Is the increased maintenance workload worth the benefit it provides in DRY (Don't Repeat Yourself)?

If the target is a web library, check if there is an [existing port](http://catppuccin.com/ports) for it. The methods outlined in [Syntax Highlighting](/contributing/guides/syntax-highlighting/) may be used to import the theme for the library in question. Some ports may need changes upstreamed to work for userstyles purposes; in these cases, please coordinate with userstyles staff to determine the most suitable approach.

## Developing locally

The development server lets a userstyle use your local library files without changing its checked-in imports. It serves a transformed copy of the selected userstyle on the loopback interface and adds a library checksum to each import so that Stylus notices library changes.

1. [Install Deno](https://docs.deno.com/runtime/getting_started/installation/) and clone this repository.
2. From the repository root, start the server with a userstyle slug or path:

   ```sh
   deno task serve github
   # Equivalent: deno task serve styles/github
   ```

3. Open the URL printed by the command in your browser and install or update it with Stylus. Follow the [hot reloading guide](/contributing/tips-and-tricks/hot-reloading/) if live reloading is not already enabled.
4. Edit the selected userstyle or files under `lib/`. The server rebuilds the served userstyle automatically.
5. Press <kbd>Ctrl</kbd>+<kbd>C</kbd> to stop the server.

The server listens only on `127.0.0.1` and uses port 8000 by default. If that port is occupied, select another one:

```sh
deno task serve --port 8123 github
```

Run `deno task serve --help` to see all supported arguments.
