import Ajv, { Schema } from "ajv";
import { parse } from "std/yaml/parse.ts";

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
