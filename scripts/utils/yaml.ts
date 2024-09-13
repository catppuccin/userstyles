import Ajv, { type Schema } from "ajv";
import type { SetRequired } from "type-fest";
import type { UserstylesSchema } from "@/types/userstyles.d.ts";

import * as YAML from "@std/yaml";
import * as path from "@std/path";

import { REPO_ROOT, USERSTYLES_SCHEMA } from "@/constants.ts";

import { log } from "@/lint/logger.ts";
import { sprintf } from "@std/fmt/printf";

/**
 * @param content A string of YAML content
 * @param schema  A JSON schema
 * @returns A promise that resolves to the parsed YAML content, verified against the schema. Rejects if the content is invalid.
 */
export function validateYaml<T>(
  content: string,
  schema: Schema,
): T {
  const ajv = new Ajv.default();
  const validate = ajv.compile<T>(schema);
  const data = YAML.parse(content);

  if (!validate(data)) {
    console.log(
      "Found schema errors in scripts/userstyles.yml: " +
        validate.errors?.map((err) =>
          sprintf(
            "%s %s%s",
            err.instancePath.slice(1).replaceAll("/", "."),
            err.message,
            err.params.allowedValues
              ? ` (${
                JSON.stringify(
                  err.params.allowedValues,
                  undefined,
                )
              })`
              : "",
          )
        ).join(" and "),
    );
    Deno.exit(1);
  }

  return data as T;
}

/**
 * Utility function that calls {@link validateYaml} on the userstyles.yml file.
 * Fails when data.userstyles is undefined.
 */
export function getUserstylesData(): Userstyles {
  const content = Deno.readTextFileSync(
    path.join(REPO_ROOT, "scripts/userstyles.yml"),
  );

  try {
    const data = validateYaml<UserstylesSchema>(
      content,
      USERSTYLES_SCHEMA,
    );

    if (data.userstyles === undefined || data.collaborators === undefined) {
      console.log(
        "userstyles.yml is missing required field 'userstyles'",
      );
      Deno.exit(1);
    }

    return data as Userstyles;
  } catch (err) {
    if (err.name === "YAMLError") {
      const groups =
        /(?<message>.*) at line (?<line>\d+), column (?<column>\d+):[\S\s]*/
          .exec(err.message)?.groups;
      log.error(
        groups!.message,
        {
          file: "scripts/userstyles.yml",
          startLine: Number(groups!.line),
          content: content,
        },
      );
    } else {
      console.log(err);
    }

    Deno.exit(1);
  }
}

type Userstyles = SetRequired<UserstylesSchema, "userstyles" | "collaborators">;
