// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { Schema } from "../schema.ts";
import { regexp, undefinedType } from "../type/mod.ts";
import { def } from "./default.ts";
/***
 * Extends JS-YAML default schema with additional JavaScript types
 * It is not described in the YAML specification.
 * Functions are no longer supported for security reasons.
 *
 * @example
 * ```ts
 * import {
 *   EXTENDED_SCHEMA,
 *   parse,
 * } from "https://deno.land/std@$STD_VERSION/encoding/yaml.ts";
 *
 * const data = parse(
 *   `
 *   regexp:
 *     simple: !!js/regexp foobar
 *     modifiers: !!js/regexp /foobar/mi
 *   undefined: !!js/undefined ~
 * # Disabled, see: https://github.com/denoland/deno_std/pull/1275
 * #  function: !!js/function >
 * #    function foobar() {
 * #      return 'hello world!';
 * #    }
 * `,
 *   { schema: EXTENDED_SCHEMA },
 * );
 * ```
 */ export const extended = new Schema({
    explicit: [
        regexp,
        undefinedType
    ],
    include: [
        def
    ]
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL3NjaGVtYS9leHRlbmRlZC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBTY2hlbWEgfSBmcm9tIFwiLi4vc2NoZW1hLnRzXCI7XG5pbXBvcnQgeyByZWdleHAsIHVuZGVmaW5lZFR5cGUgfSBmcm9tIFwiLi4vdHlwZS9tb2QudHNcIjtcbmltcG9ydCB7IGRlZiB9IGZyb20gXCIuL2RlZmF1bHQudHNcIjtcblxuLyoqKlxuICogRXh0ZW5kcyBKUy1ZQU1MIGRlZmF1bHQgc2NoZW1hIHdpdGggYWRkaXRpb25hbCBKYXZhU2NyaXB0IHR5cGVzXG4gKiBJdCBpcyBub3QgZGVzY3JpYmVkIGluIHRoZSBZQU1MIHNwZWNpZmljYXRpb24uXG4gKiBGdW5jdGlvbnMgYXJlIG5vIGxvbmdlciBzdXBwb3J0ZWQgZm9yIHNlY3VyaXR5IHJlYXNvbnMuXG4gKlxuICogQGV4YW1wbGVcbiAqIGBgYHRzXG4gKiBpbXBvcnQge1xuICogICBFWFRFTkRFRF9TQ0hFTUEsXG4gKiAgIHBhcnNlLFxuICogfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9lbmNvZGluZy95YW1sLnRzXCI7XG4gKlxuICogY29uc3QgZGF0YSA9IHBhcnNlKFxuICogICBgXG4gKiAgIHJlZ2V4cDpcbiAqICAgICBzaW1wbGU6ICEhanMvcmVnZXhwIGZvb2JhclxuICogICAgIG1vZGlmaWVyczogISFqcy9yZWdleHAgL2Zvb2Jhci9taVxuICogICB1bmRlZmluZWQ6ICEhanMvdW5kZWZpbmVkIH5cbiAqICMgRGlzYWJsZWQsIHNlZTogaHR0cHM6Ly9naXRodWIuY29tL2Rlbm9sYW5kL2Rlbm9fc3RkL3B1bGwvMTI3NVxuICogIyAgZnVuY3Rpb246ICEhanMvZnVuY3Rpb24gPlxuICogIyAgICBmdW5jdGlvbiBmb29iYXIoKSB7XG4gKiAjICAgICAgcmV0dXJuICdoZWxsbyB3b3JsZCEnO1xuICogIyAgICB9XG4gKiBgLFxuICogICB7IHNjaGVtYTogRVhURU5ERURfU0NIRU1BIH0sXG4gKiApO1xuICogYGBgXG4gKi9cbmV4cG9ydCBjb25zdCBleHRlbmRlZCA9IG5ldyBTY2hlbWEoe1xuICBleHBsaWNpdDogW3JlZ2V4cCwgdW5kZWZpbmVkVHlwZV0sXG4gIGluY2x1ZGU6IFtkZWZdLFxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBRTFFLFNBQVMsTUFBTSxRQUFRLGVBQWU7QUFDdEMsU0FBUyxNQUFNLEVBQUUsYUFBYSxRQUFRLGlCQUFpQjtBQUN2RCxTQUFTLEdBQUcsUUFBUSxlQUFlO0FBRW5DOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EyQkMsR0FDRCxPQUFPLE1BQU0sV0FBVyxJQUFJLE9BQU87SUFDakMsVUFBVTtRQUFDO1FBQVE7S0FBYztJQUNqQyxTQUFTO1FBQUM7S0FBSTtBQUNoQixHQUFHIn0=