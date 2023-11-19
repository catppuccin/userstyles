// deno-fmt-ignore-file

/**
 * A form item
 * https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-githubs-form-schema#about-githubs-form-schema
 */
export type FormItem = {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
} & {
  [k: string]: unknown;
};
export type Assignee = string;

export interface GitHubIssueFormsConfigFileSchema {
  /**
   * An issue template name
   * https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms#top-level-syntax
   */
  name: string;
  /**
   * An issue template description
   * https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms#top-level-syntax
   */
  description: string;
  /**
   * An issue template body
   * https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms#top-level-syntax
   *
   * @minItems 1
   */
  body: [FormItem, ...FormItem[]];
  /**
   * An issue template assignees
   * https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms#top-level-syntax
   */
  assignees?: Assignee | [Assignee, ...Assignee[]];
  /**
   * An issue template labels
   * https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms#top-level-syntax
   *
   * @minItems 1
   */
  labels?: [string, ...string[]];
  /**
   * An issue template title
   * https://docs.github.com/en/communities/using-templates-to-encourage-useful-issues-and-pull-requests/syntax-for-issue-forms#top-level-syntax
   */
  title?: string;
}
