import type { CategoriesSchema, UserstylesSchema } from "../types/mod.ts";
import type { SetRequired } from "type-fest/source/set-required.d.ts";
import {
  CATEGORIES_SCHEMA,
  REPO_ROOT,
  STYLES_ROOT,
  USERSTYLES_SCHEMA,
} from "../constants.ts";

import * as yaml from "@std/yaml";
import path from "node:path";

import Ajv, { type Schema } from "ajv";
import { log } from "./logger.ts";
import { sprintf } from "@std/fmt/printf";
import { readDirSync, readTextFileSync } from "./fs.ts";

type Userstyles = SetRequired<
UserstylesSchema.UserstylesSchema,
"userstyles" | "collaborators"
>;

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
          sprintf(
            "%s %s%s",
            err.instancePath.slice(1).replaceAll("/", "."),
            err.message,
            err.params.allowedValues
              ? ` (${JSON.stringify(err.params.allowedValues, undefined)})`
              : "",
          )
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
 * Requires the `userstyles` and `collaborators` fields.
 */
export function getUserstylesData(): Userstyles {
  const content = readTextFileSync(
    path.join(REPO_ROOT, "scripts/userstyles.yml"),
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
    if (err instanceof Error && err.name === "SyntaxError") {
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
 * Utility function that calls {@link validateYaml} on the categories.yml file.
 */
export async function getCategoriesData(): Promise<
  CategoriesSchema.CategoryDefinitions
> {
  const content = await fetch(
    "https://raw.githubusercontent.com/catppuccin/catppuccin/de9d2cd963059753c8fd66fbb6f807be95c6cc1e/resources/categories.yml",
  ).then((res) => res.text());

  const data = validateYaml<CategoriesSchema.CategoryDefinitions>(
    content,
    CATEGORIES_SCHEMA,
    "categories.yml",
  );

  return data;
}

export function getUserstylesFiles(): string[] {
  const files: string[] = [];
  for (const dir of readDirSync(STYLES_ROOT)) {
    if (!dir.isDirectory()) continue;
    files.push(
      path.join(STYLES_ROOT, dir.name, "catppuccin.user.less"),
    );
  }
  return files;
}
