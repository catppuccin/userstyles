import type { CategoriesSchema, UserstylesSchema } from "#/types/mod.ts";
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
import { log } from "#/utils/logger.ts";

/**
 * @param content A string of YAML content
 * @param schema  A JSON schema
 * @returns A promise that resolves to the parsed YAML content, verified against the schema. Rejects if the content is invalid.
 */
export function validateYaml<T>(
  content: string,
  schema: Schema,
  file: string,
  options?: Ajv.Options,
): T {
  const ajv = new Ajv.default(options);
  const validate = ajv.compile<T>(schema);
  const data = yaml.parse(content);

  if (!validate(data)) {
    log.error(
      validate
        .errors!.map((err) =>
          `${err.instancePath.slice(1).replaceAll("/", ".")} ${err.message}${
            err.params.allowedValues
              ? ` (${JSON.stringify(err.params.allowedValues, undefined)})`
              : ""
          }`
        )
        .join(" and "),
      {
        file,
      },
    );
    process.exit(1);
  }

  return data as T;
}

/**
 * Utility function that calls {@link validateYaml} on the userstyles.yml file.
 * Fails when data.userstyles is undefined.
 */
export function getUserstylesData(): Userstyles {
  const content = readFileSync(
    path.join(REPO_ROOT, "scripts/userstyles.yml"),
    "utf8",
  );

  try {
    const data = validateYaml<UserstylesSchema.UserstylesSchema>(
      content,
      USERSTYLES_SCHEMA,
      "scripts/userstyles.yml",
      { schemas: [CATEGORIES_SCHEMA] },
    );

    for (const field of ["userstyles", "collaborators"] as const) {
      if (data[field] === undefined) {
        log.error(`Missing required field \`${field}\``, {
          file: "scripts/userstyles.yml",
        });
        process.exit(1);
      }
    }

    return data as Userstyles;
  } catch (err) {
    if (err instanceof yaml.YAMLParseError) {
      const groups =
        /(?<message>.*) at line (?<line>\d+), column (?<column>\d+):[\S\s]*/
          .exec(
            err.message,
          )?.groups;
      log.error(groups!.message, {
        file: "scripts/userstyles.yml",
        startLine: Number(groups!.line),
        content: content,
      });
    } else {
      throw err;
    }

    process.exit(1);
  }
}

/**
 * Utility function that calls {@link validateYaml} on the ports.yml file.
 * Fails when data.userstyles is undefined.
 */
export async function getCategoriesData(): Promise<
  CategoriesSchema.CategoryDefinitions
> {
  const content = await fetch(
    "https://raw.githubusercontent.com/catppuccin/catppuccin/d4f82739e687cfd19d168be355367fdbbcc8e029/resources/categories.yml",
  ).then((res) => res.text());

  const data = validateYaml<CategoriesSchema.CategoryDefinitions>(
    content,
    CATEGORIES_SCHEMA,
    "categories.yml",
  );

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
