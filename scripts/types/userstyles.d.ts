// deno-fmt-ignore-file

/**
 * The name of the userstyle.
 */
export type Name = string;
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
 * The hyperlink of the website that is being themed.
 */
export type WebsiteLink = string;
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
 * If another website can be themed with this userstyle, provide the name of the other website here (e.g. `anilist` for `anichart`, where AniChart can be themed with the same CSS applied in AniList.)
 */
export type Alias = string;
/**
 * An additional note for the Usage section of the userstyle README.
 */
export type Note = string;
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
  link: WebsiteLink;
  color: Color;
  icon?: Icon;
  alias?: Alias;
  note?: Note;
  "current-maintainers": CurrentMaintainers;
  "past-maintainers"?: PastMaintainers;
}
