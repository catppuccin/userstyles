import Ajv, { Schema } from "ajv";
import { parse } from "std/yaml/parse.ts";
import { join } from "std/path/join.ts";
import { SetRequired } from "type-fest/source/set-required.d.ts";

import { REPO_ROOT, userStylesSchema } from "@/deps.ts";
import { UserstylesSchema } from "@/types/userstyles.d.ts";
import { YAMLError } from "std/yaml/_error.ts";
import { log } from "@/lint/logger.ts";
import { sprintf } from "std/fmt/printf.ts";

/**
 * @param content A string of YAML content
 * @param schema  A JSON schema
 * @returns A promise that resolves to the parsed YAML content, verified against the schema. Rejects if the content is invalid.
 */
export const validateYaml = <T>(
  content: string,
  schema: Schema,
): T => {
  const ajv = new Ajv.default();
  const validate = ajv.compile<T>(schema);
  const data = parse(content);

  if (!validate(data)) {
    console.log(
      "Found schema errors in scripts/userstyles.yml: " +
        validate.errors?.map((err) =>
          sprintf(
            "%s %s%s",
            err.instancePath.slice(1).replaceAll("/", "."),
            err.message,
            err.params.allowedValues
              ? ` (${JSON.stringify(err.params.allowedValues, undefined)})`
              : "",
          )
        ).join(" and "),
    );
    Deno.exit(1);
  }

  return data as T;
};

/**
 * Utility function that calls {@link validateYaml} on the userstyles.yml file.
 * Fails when data.userstyles is undefined.
 */
export const getUserstylesData = (): Userstyles => {
  const content = Deno.readTextFileSync(
    join(REPO_ROOT, "scripts/userstyles.yml"),
  );

  try {
    const data = validateYaml<UserstylesSchema>(
      content,
      userStylesSchema,
    );

    if (data.userstyles === undefined || data.collaborators === undefined) {
      console.log("userstyles.yml is missing required fields");
      Deno.exit(1);
    }

    return data as Userstyles;
  } catch (err) {
    if (err instanceof YAMLError) {
      const groups =
        /(?<message>.*) at line (?<line>\d+), column (?<column>\d+):[\S\s]*/
          .exec(err.message)?.groups;
      log(
        groups!.message,
        {
          file: "scripts/userstyles.yml",
          startLine: Number(groups!.line),
          content: content,
        },
        "error",
      );
    } else {
      console.log(err);
    }

    Deno.exit(1);
  }
};

/**
 * Utility function that formats a list of items into the "x, y, ..., and z" format.
 * @example
 * formatListOfItems(['x']); // 'x'
 * @example
 * formatListOfItems(['x', 'y']); // 'x and y'
 * @example
 * formatListOfItems(['x', 'y', 'z']); // 'x, y, and z'
 */
export const formatListOfItems = (items: unknown[]): string => {
  // If there are two items, connect them with an "and".
  if (items.length === 2) return items.join(" and ");
  // Otherwise, there is either just one item or more than two items.
  return items.reduce((prev, curr, idx, arr) => {
    // If this is the first item of the items we are looping through, set our initial string to it.
    if (idx === 0) return curr;
    // If this is the last one, add a comma (Oxford commas are amazing) followed by "and" and the item to the string.
    if (curr === arr.at(-1)) return prev + `, and ${curr}`;
    // Otherwise, it is some item in the middle of the list and we can just add it as a comma followed by the item to the string.
    return prev + `, ${curr}`;
  }) as string;
};

type Userstyles = SetRequired<UserstylesSchema, "userstyles" | "collaborators">;
