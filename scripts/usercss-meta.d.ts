declare namespace usercssMeta {
  export const ParseError: ParseError;

  export interface ParseError extends Error {
    code:
      | "invalidCheckboxDefault"
      | "invalidRange"
      | "invalidRangeMultipleUnits"
      | "invalidRangeTooManyValues"
      | "invalidRangeValue"
      | "invalidRangeDefault"
      | "invalidRangeMin"
      | "invalidRangeMax"
      | "invalidRangeStep"
      | "invalidRangeUnits"
      | "invalidNumber"
      | "invalidSelect"
      | "invalidSelectValue"
      | "invalidSelectEmptyOptions"
      | "invalidSelectLabel"
      | "invalidSelectMultipleDefaults"
      | "invalidSelectNameDuplicated"
      | "invalidString"
      | "invalidURLProtocol"
      | "invalidVersion"
      | "invalidWord"
      | "missingChar"
      | "missingEOT"
      | "missingMandatory"
      | "missingValue"
      | "unknownJSONLiteral"
      | "unknownMeta"
      | "unknownVarType";

    message: string;

    /**
     * The string index where the error occurs
     */
    index: number;

    /**
     * An array of values that is used to compose the error message.
     * This allows other clients to generate i18n error message.
     */
    args: unknown[];
  }

  // TODO: export util types
  // export const util: {};

  /**
   * This is a shortcut of `createParser(options).parse(text);`
   */
  export function parse(
    content: string,
    options?: ParserOptions,
  ): ParseResult;

  /**
   * Create a metadata parser.
   */
  export function createParser(options?: ParserOptions): Parser;

  // TODO: export stringify types
  // export function stringify(
  //   metadata: Metadata,
  //   options: StringifierOptions,
  // ): string;
  // export function createStringifier(options: StringifierOptions): Stringifier;

  type Parser = {
    /**
     * Parse the text (metadata header) and return the result.
     */
    parse: typeof parse;

    /**
     * Validate the value of the variable object.
     * This function uses the validators defined in `createParser`.
     */
    validateVar: (varObj: VarObj) => void;
  };

  type ParserOptions = {
    /**
     * `unknownKey` decides how to parse unknown keys. Possible values are:
     * - `ignore`: The directive is ignored. Default.
     * - `assign`: Assign the text value (characters before `\s*\n`) to result object.
     * - `throw`: Throw a `ParseError`.
     * @default "ignore"
     */
    unknownKey?: "ignore" | "assign" | "throw";

    /**
     * mandatoryKeys marks multiple keys as mandatory. If some keys are missing then throw a ParseError
     * @default ["name", "namespace", "version"]
     */
    mandatoryKeys?: string[];

    /**
     * A `key`/`parseFunction` map.
     * It allows users to extend the parser.
     *
     * @example
     * const parser = createParser({
     *   mandatoryKeys: [],
     *   parseKey: {
     *     myKey: util.parseNumber
     *   }
     * });
     * const {metadata} = parser.parse(`
     *   /* ==UserStyle==
     *   \@myKey 123456
     *   ==/UserStyle==
     * `);
     * assert.equal(metadata.myKey, 123456);
     */
    parseKey?: Record<string, unknown>;

    /**
     * A `variableType`/`parseFunction` map.
     * It extends the parser to parse additional variable types.
     *
     * @example
     * const parser = createParser({
     *   mandatoryKeys: [],
     *   parseVar: {
     *     myvar: util.parseNumber
     *   }
     * });
     * const {metadata} = parser.parse(`/* ==UserStyle==
     * \@var myvar var-name 'Customized variable' 123456
     * ==/UserStyle== *\/`);
     * const va = metadata.vars['var-name'];
     * assert.equal(va.type, 'myvar');
     * assert.equal(va.label, 'Customized variable');
     * assert.equal(va.default, 123456);
     */
    parseVar?: Record<string, unknown>;
    /**
     * A `key`/`validateFunction` map, which is used to validate the metadata value.
     * The function accepts a state object.
     *
     * @example
     * const parser = createParser({
     *   validateKey: {
     *     updateURL: state => {
     *       if (/example\.com/.test(state.value)) {
     *         throw new ParseError({
     *           message: 'Example.com is not a good URL',
     *           index: state.valueIndex
     *         });
     *       }
     *     }
     *   }
     * });
     */
    validateKey?: Record<string, validateFn>;

    /**
     * A `variableType`/`validateFunction` map, which is used to validate variables.
     * The function accepts a state object.
     *
     * @example
     * const parser = createParser({
     *   validateVar: {
     *     color: state => {
     *       if (state.value === 'red') {
     *         throw new ParseError({
     *           message: '`red` is not allowed',
     *           index: state.valueIndex
     *         });
     *       }
     *     }
     *   }
     * });
     */
    validateVar?: Record<string, (state: StateObject) => void>;

    /**
     * If allowErrors is true, the parser will collect parsing errors while
     * `parser.parse()` and return them as {@link ParseResult.errors}
     * Otherwise, the first parsing error will be thrown.
     * @default false
     */
    allowErrors?: boolean;
  };

  export type StateObject = {
    key: string;
    type: string;
    value: string;
    varResult: unknown;
    text: string;
    lastIndex: number;
    valueIndex: number;
    shouldIgnore: boolean;
  };

  type validateFn = (state: StateObject) => void;

  type VarObj = {
    label: string;
    name: string;
    value?: string;
    default?: string;
    options?: unknown;
  };
  type Metadata = {
    vars: VarObj[];
    [key: string]: unknown;
  };

  type ParseResult = {
    metadata: Metadata;
    errors: ParseError[];
  };
}

declare module "usercss-meta" {
  export = usercssMeta;
}
