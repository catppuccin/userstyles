// deno-fmt-ignore-file

/**
 * The name of the userstyle.
 */
export type Name = string;
/**
 * The url of the website that is being themed.
 */
export type Link = string;
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
  | "documentation_generator"
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
  | "package_registry"
  | "photo_and_video"
  | "productivity"
  | "search_engine"
  | "social_networking"
  | "syntax_highlighting"
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
 * An additional note that users should read.
 */
export type Note = string;
/**
 * The name of the website.
 */
export type WebsiteName = string;
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
 * All userstyles in the Catppuccin organisation.
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
  link: Link;
  categories: Categories;
  color: Color;
  icon?: Icon;
  note?: Note;
  supports?: Supports;
  "current-maintainers": CurrentMaintainers;
  "past-maintainers"?: PastMaintainers;
}
/**
 * All websites that the userstyle also supports.
 */
export interface Supports {
  [k: string]: Website;
}
/**
 * The unique identifier of the supported website, usually the name of the website lowercased.
 *
 * This interface was referenced by `Supports`'s JSON-Schema definition
 * via the `patternProperty` "[A-Za-z0-9_\-]".
 */
export interface Website {
  name: WebsiteName;
  link: Link;
}
