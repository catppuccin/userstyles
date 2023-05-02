/* eslint-disable */
/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

/**
 * The name of the userstyle(s).
 */
export type Name = [string, string, ...string[]] | string;
/**
 * The category that fits the port the most.
 */
export type Category =
  | "browser"
  | "browser_extension"
  | "cli"
  | "code_editor"
  | "development"
  | "game"
  | "leisure"
  | "library"
  | "messaging"
  | "note_taking"
  | "productivity"
  | "search_engine"
  | "social"
  | "system"
  | "terminal";
/**
 * The fill color for the icon on the Catppuccin website.
 */
export type Color =
  | "rosewater"
  | "flamingo"
  | "pink"
  | "mauve"
  | "red"
  | "maroon"
  | "peach"
  | "yellow"
  | "green"
  | "teal"
  | "sky"
  | "sapphire"
  | "blue"
  | "lavender"
  | "text";
/**
 * The icon to use on the website. This should be the same name as the SVG file on https://simpleicons.org/. If a `.svg` suffix is present, it's taken from the local website repository resources.
 */
export type Icon = string;
/**
 * The hyperlink of the app that is being themed
 */
export type ApplicationLink = [unknown, unknown, ...unknown[]] | string;
/**
 * The Usage section of the userstyle README
 */
export type Usage = string;
/**
 * The FAQ section of the userstyle README
 *
 * @minItems 1
 */
export type FAQ = [
  {
    question: Question;
    answer: Answer;
    [k: string]: unknown;
  },
  ...{
    question: Question;
    answer: Answer;
    [k: string]: unknown;
  }[]
];
/**
 * A question that a user may have about the userstyle
 */
export type Question = string;
/**
 * An answer to the question about the userstyle
 */
export type Answer = string;
/**
 * List of all maintainers for this specific userstyle
 *
 * @minItems 1
 */
export type UserstyleMaintainers = [
  {
    name?: DisplayName;
    url: GitHubProfile;
    [k: string]: unknown;
  },
  ...{
    name?: DisplayName;
    url: GitHubProfile;
    [k: string]: unknown;
  }[]
];
/**
 * The display name of the maintainer to show in the userstyle README
 */
export type DisplayName = string;
/**
 * The GitHub profile link of the maintainer to show in the userstyle README
 */
export type GitHubProfile = string;
/**
 * List of all maintainers within the userstyles repository
 *
 * @minItems 1
 */
export type AllMaintainers = [
  {
    name?: DisplayName;
    url: GitHubProfile;
    [k: string]: unknown;
  },
  ...{
    name?: DisplayName;
    url: GitHubProfile;
    [k: string]: unknown;
  }[]
];

export interface Demo {
  userstyles?: Userstyles;
  maintainers?: AllMaintainers;
}
/**
 * All userstyles in the Catppuccin org.
 */
export interface Userstyles {
  [k: string]: Userstyle;
}
/**
 * The directory of the userstyle.
 *
 * This interface was referenced by `Userstyles`'s JSON-Schema definition
 * via the `patternProperty` "[A-Za-z0-9_\-]".
 */
export interface Userstyle {
  name: Name;
  category: Category;
  color?: Color;
  icon?: Icon;
  readme: README;
}
/**
 * Options to help in the auto-generation of the userstyle README
 */
export interface README {
  "app-link": ApplicationLink;
  usage?: Usage;
  faq?: FAQ;
  maintainers: UserstyleMaintainers;
  [k: string]: unknown;
}
