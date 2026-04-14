---
title: Library Modules
description: Reference for library modules.
---

Library modules consist of collections of mixins which target design systems or commonly used libraries.

They follow a standard structure and should be built to be modular and reusable across several userstyles.

## Structure

The [standard library](https://github.com/catppuccin/userstyles/blob/main/lib/std/v1.less) is a good reference as to how libraries can be structured.

All libraries are in lib/ with subdirectories per library name, and versioned files (e.g., `v1.less`, `v2.less`, etc).

They must have a top level mixin in the format `#__libraryname`. All constants and variables should be under a nested `.base` mixin, used like `#__libraryname.base()` under `#lib.palette()`.

You may include other mixins and constants, but they must be under the top level mixin for scoping purposes.

## Creation

Identify what your library module will achieve. Are you targeting a design system, framework, or a library?

If a design system or framework, is it specific to one userstyle or reusable across multiple? What are the popularity metrics of it? Is it worth the maintenance burden for the benefit it provides in DRY?

If it is a web library, you should check if there is an [existing port](http://catppuccin.com/ports) for it. You may be able to use the methods outlined in [Syntax Highlighting](/contributing/guides/syntax-highlighting/) to import the theme for the library in question. However, if there is no CSS support it may be necessary to upstream the changes needed for it to work.
