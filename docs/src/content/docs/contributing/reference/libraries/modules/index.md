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

If it is a web library, you should check if there is an [existing port](http://catppuccin.com/ports) for it. You may be able to use the methods outlined in [Syntax Highlighting](/contributing/guides/syntax-highlighting/) to import the theme for the library in question. However, if there is no CSS support it may be necessary to upstream the changes needed for it to work.
