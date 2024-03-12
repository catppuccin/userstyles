import Ajv, { Schema } from "ajv";
import { parse } from "std/yaml/parse.ts";
import { join } from "std/path/join.ts";
import { SetRequired } from "type-fest/source/set-required.d.ts";

import { REPO_ROOT, userStylesSchema } from "@/deps.ts";
import { UserstylesSchema } from "@/types/userstyles.d.ts";
import { YAMLError } from "std/yaml/_error.ts";
import { log } from "@/lint/logger.ts";

/**
 * @param content A string of YAML content
 * @param schema  A JSON schema
 * @returns A promise that resolves to the parsed YAML content, verified against the schema. Rejects if the content is invalid.
 */
export const validateYaml = <T>(
  content: string,
  schema: Schema,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    const ajv = new Ajv.default();
    const validate = ajv.compile<T>(schema);
    const data = parse(content);

    if (!validate(data)) return reject(validate.errors);

    return resolve(data);
  });
};

/**
 * Utility function that calls {@link validateYaml} on the userstyles.yml file.
 * Fails when data.userstyles is undefined.
 */
export const getUserstylesData = (): Promise<Userstyles> => {
  return new Promise((resolve, reject) => {
    validateYaml<UserstylesSchema>(
      Deno.readTextFileSync(join(REPO_ROOT, "scripts/userstyles.yml")),
      userStylesSchema,
    ).then((data) => {
      if (data.userstyles === undefined || data.collaborators === undefined) {
        return reject("userstyles.yml is missing required fields");
      }
      return resolve(data as Userstyles);
    }).catch(async (err: YAMLError) => {
      await log(err.message.replace(/ at line \d+, column \d+:[\S\s]*/gm, ""), {
        file: "scripts/userstyles.yml",
        startLine: err.mark.line,
        startColumn: err.mark.column,
        content: err.buffer,
      }, "error"); // <--- this outputs nothing

      Deno.exit(1);
    });
  });
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
