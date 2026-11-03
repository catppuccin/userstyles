import type { UserstylesSchema } from "#/types/mod.ts";
import type { SetRequired } from "type-fest";
import {
  CATEGORIES_SCHEMA,
  REPO_ROOT,
  STYLES_ROOT,
  USERSTYLES_SCHEMA,
} from "#/constants.ts";

import { readdirSync, readFileSync } from "node:fs";

import * as yaml from "yaml";
import path from "node:path";

import Ajv, { type Schema } from "ajv";
import { type Diagnostic, report } from "#/utils/diagnostics.ts";

export const USERSTYLES_FILE = "scripts/userstyles.yml";

/**
 * @param data Parsed data
 * @param schema A JSON schema
 * @returns A message describing the validation errors, or `undefined` if the data is valid.
 */
function validateSchema(
  data: unknown,
  schema: Schema,
  options?: Ajv.Options,
): string | undefined {
  const ajv = new Ajv.default(options);
  const validate = ajv.compile(schema);

  if (validate(data)) return;

  return validate
    .errors!.map((err) =>
      `${err.instancePath.slice(1).replaceAll("/", ".")} ${err.message}${
        err.params.allowedValues
          ? ` (${JSON.stringify(err.params.allowedValues, undefined)})`
          : ""
      }`
    )
    .join(" and ");
}

/**
 * Parses and validates the userstyles.yml file. Returns diagnostics instead of the data if it is invalid.
 * Requires the `userstyles` and `collaborators` fields.
 */
export function loadUserstylesData():
  | { data: Userstyles; diagnostics: [] }
  | { data: undefined; diagnostics: Diagnostic[] } {
  const content = readFileSync(path.join(REPO_ROOT, USERSTYLES_FILE), "utf8");
  const error = (message: string, startLine?: number) => ({
    data: undefined,
    diagnostics: [{
      file: USERSTYLES_FILE,
      severity: "error" as const,
      message,
      span: startLine !== undefined
        ? { line: { start: startLine } }
        : undefined,
      content,
    }],
  });

  let data;
  try {
    data = yaml.parse(content);
  } catch (err) {
    if (!(err instanceof yaml.YAMLParseError)) throw err;
    const groups =
      /(?<message>.*) at line (?<line>\d+), column (?<column>\d+):[\S\s]*/
        .exec(
          err.message,
        )?.groups;
    return error(groups!.message, Number(groups!.line));
  }

  const errors = validateSchema(data, USERSTYLES_SCHEMA, {
    schemas: [CATEGORIES_SCHEMA],
  });
  if (errors) return error(errors);

  for (const field of ["userstyles", "collaborators"] as const) {
    if (data[field] === undefined) {
      return error(`Missing required field \`${field}\`.`);
    }
  }

  return { data, diagnostics: [] };
}

/**
 * Like {@link loadUserstylesData}, but reports the diagnostics and exits if the data is invalid.
 */
export function getUserstylesData(): Userstyles {
  const { data, diagnostics } = loadUserstylesData();
  if (!data) {
    report(diagnostics);
    process.exit(1);
  }
  return data;
}

type Userstyles = SetRequired<
  UserstylesSchema.UserstylesSchema,
  "userstyles" | "collaborators"
>;

export function getUserstylesFiles(): string[] {
  const files: string[] = [];
  for (const dir of readdirSync(STYLES_ROOT, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    files.push(path.join(STYLES_ROOT, dir.name, "catppuccin.user.less"));
  }
  return files;
}

/**
 * Extracts the userstyle slug from a CLI argument, which can be the slug itself or a path to the userstyle
 * (e.g. `github`, `styles/github`, `styles/github/catppuccin.user.less`).
 */
export function parseUserstyleArgument(arg?: string): string | undefined {
  return arg?.match(
    /(?<base>styles\/)?(?<userstyle>[a-z0-9_\-.]+)(?<trailing>\/)?(?<file>catppuccin\.user\.less)?/,
  )?.groups?.userstyle;
}
