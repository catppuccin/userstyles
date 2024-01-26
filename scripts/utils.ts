import Ajv, { Schema } from "ajv";
import { parse } from "std/yaml/parse.ts";
import { join } from "std/path/join.ts";
import { SetRequired } from "type-fest/source/set-required.d.ts";

import { REPO_ROOT, userStylesSchema } from "@/deps.ts";
import { UserstylesSchema } from "@/types/userstyles.d.ts";

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
    });
  });
};

/**
 * Utility function that formats a list of items into the "x, y, ..., and z" format.
 */
export const formatListOfItems = (items: unknown[]): string => {
  if (items.length === 2) return items.join(" and ");
  return items.reduce((prev, curr, idx, arr) => {
    if (idx === 0) return curr;
    if (curr === arr.at(-1)) return prev + `, and ${curr}`;
    return prev + `, ${curr}`;
  }) as string;
};

type Userstyles = SetRequired<UserstylesSchema, "userstyles" | "collaborators">;
