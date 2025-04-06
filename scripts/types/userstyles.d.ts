// deno-fmt-ignore-file

/**
 * The name of the userstyle(s).
 */
export type Name = [string, string, ...string[]] | string;
/**
 * The categories that fit the userstyle the most, the first category is the primary category which the userstyle will be listed under on the README.
 *
 * @minItems 1
 * @maxItems 3
 */
export type Categories = [Category] | [Category, Category] | [Category, Category, Category];
export type Category =
  | "3d_modelling"
  | "analytics"
  | "application_launcher"
  | "artificial_intelligence"
  | "boot_loader"
  | "browser"
  | "browser_extension"
  | "cli"
  | "code_editor"
  | "desktop_environment"
  | "development"
  | "discussion_forum"
  | "document_viewer"
  | "education"
  | "email_client"
  | "entertainment"
  | "file_manager"
  | "game"
  | "game_development"
  | "health_and_fitness"
  | "library"
  | "music"
  | "news_and_journalism"
  | "note_taking"
  | "notification_daemon"
  | "photo_and_video"
  | "productivity"
  | "search_engine"
  | "social_networking"
  | "system"
  | "terminal"
  | "translation_tool"
  | "userstyle"
  | "wiki"
  | "window_manager";
/**
 * The fill color for the icon on the Catppuccin website, which should match the color used by Simple Icons. If the icon does not exist in Simple Icons, choose the most suitable color from the branding.
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
 * The hyperlink of the app that is being themed.
 */
export type ApplicationLink = [string, string, ...string[]] | string;
/**
 * An additional note for the Usage section of the userstyle README.
 */
export type Note = string;
/**
 * The FAQ section of the userstyle README.
 *
 * @minItems 1
 */
export type FAQ = [
  {
    question: Question;
    answer: Answer;
  },
  ...{
    question: Question;
    answer: Answer;
  }[]
];
/**
 * A question that a user may have about the userstyle.
 */
export type Question = string;
/**
 * An answer to the question about the userstyle.
 */
export type Answer = string;
/**
 * List of all active maintainers for this userstyle.
 */
export type CurrentMaintainers = string[];
/**
 * List of all users that have maintained this userstyle in the past.
 *
 * @minItems 1
 */
export type PastMaintainers = [string, ...string[]];
/**
 * Represents all maintainers and contributors to all userstyles.
 *
 * @minItems 1
 */
export type AllCollaborators = [string, ...string[]];

export interface UserstylesSchema {
  userstyles?: Userstyles;
  collaborators?: AllCollaborators;
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
  categories: Categories;
  color: Color;
  icon?: Icon;
  readme: README;
  "current-maintainers": CurrentMaintainers;
  "past-maintainers"?: PastMaintainers;
}
/**
 * Options to help in the auto-generation of the userstyle README.
 */
export interface README {
  "app-link": ApplicationLink;
  note?: Note;
  faq?: FAQ;
}
