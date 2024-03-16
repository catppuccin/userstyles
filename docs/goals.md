<p align="center">
  <h2 align="center">⚽ Goals</h2>
</p>

<p align="center">
	Objectives that maintainers and contributors aim to achieve.
</p>

### Root Variables

Whilst writing an userstyle, its likely you have come across something like
`--black: #000;` in the `:root` selector. These are called root variables, and
they are used to store values that can be reused throughout the userstyle. In
userstyles, its important that we prefer using these over theming individual
elements, as it allows for a more consistent and maintainable userstyle.

### Opinionated Changes

When making changes to the userstyle, it is important to remember that different
users would like to have different things. This is why we have a set of rules
that we follow when making changes to the userstyle. This is why we have the
linter to flag any changes that do not follow these rules. These rules include:

- No font changes
- No layout changes
  - Padding, margin, and width changes
  - Hiding elements
  - Changes to the position of elements
