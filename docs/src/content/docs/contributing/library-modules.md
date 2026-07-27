---
title: Library Modules
description: Reference for library modules.
---

Library modules live in the repository's [`lib`](https://github.com/catppuccin/userstyles/tree/main/lib) directory and are hosted at `https://userstyles.catppuccin.com/lib/`. Userstyles should always import the hosted URL so that published styles work outside a local checkout.

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
