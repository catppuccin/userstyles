---
title: Reviewing userstyles
description: Notes for performing thorough new userstyle reviews.
sidebar:
  order: 1
---

A key tenant of the userstyles philosophy is starting with a complete version. Generally, we avoid merging new userstyles that do not fully theme the target application. Note that fully theming a set of (core) pages of the application, while _fully_ not theming other pages of the application, is acceptable. The reasoning for this strict policy is that userstyles maintainers come and go and it is difficult to depend on continued maintenance down the road. If a userstyle isn't initially complete, it is unlikely that more of it will be completed later.

## Tips for user interface inspection

- Inspect login/signup pages. A small part of websites, but nice to theme nonetheless.
- Be careful around hover and active states of buttons and button-like components.
- Internal links referenced in the website's footer are often good test pages if you aren't familiar with the site.
- Settings and profile pages are often missed details.
- Small details with input elements to note are borders, hover/active/focus borders, placeholder text and icons (the former should be themed by the standard library's defaults, but not always).

## Tips for userstyle source code review

Even if a userstyle is well-themed, it's also important to check that it is written well and maintainable. For example, if a website makes use of CSS variables but the userstyle is lengthy and themed using classes instead, it's often worth switching over for consistency, simplicity, and maintainability.

- Organization is key. Some strategies include organization by page or component type (e.g. buttons and inputs in one section, cards and surfaces in another, etc.). Consistent comment annotations is best.
- Importantly, ensure palette colors are used aptly and appropriately.
- Avoid overcorrections of palette colors, such as `darken` or `lighten` operations in large amounts (`darken` by 30% produces a color that is relatively distinct from the pastel palette).

## Tips for good review comments

When leaving a comment pointing out issues discovered in a review, it is important to make suggestions digestible and actionable. Provide links to relevant pages, descriptions of steps to access a certain component, and screenshots.
