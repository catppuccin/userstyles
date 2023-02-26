// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
/**
 * {@linkcode parse} and {@linkcode stringify} for handling
 * [YAML](https://yaml.org/) encoded data.
 *
 * Ported from
 * [js-yaml v3.13.1](https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da)
 *
 * If your YAML contains multiple documents in it, you can use {@linkcode parseAll} for
 * handling it.
 *
 * To handle `regexp`, and `undefined` types, use {@linkcode EXTENDED_SCHEMA}.
 * You can also use custom types by extending schemas.
 *
 * ## :warning: Limitations
 * - `binary` type is currently not stable.
 *
 * For further examples see https://github.com/nodeca/js-yaml/tree/master/examples.
 * @example
 * ```ts
 * import {
 *   parse,
 *   stringify,
 * } from "https://deno.land/std@$STD_VERSION/encoding/yaml.ts";
 *
 * const data = parse(`
 * foo: bar
 * baz:
 *   - qux
 *   - quux
 * `);
 * console.log(data);
 * // => { foo: "bar", baz: [ "qux", "quux" ] }
 *
 * const yaml = stringify({ foo: "bar", baz: ["qux", "quux"] });
 * console.log(yaml);
 * // =>
 * // foo: bar
 * // baz:
 * //   - qux
 * //   - quux
 * ```
 *
 * @module
 */ export { parse, parseAll } from "./_yaml/parse.ts";
export { stringify } from "./_yaml/stringify.ts";
export { Type } from "./_yaml/type.ts";
export { CORE_SCHEMA, DEFAULT_SCHEMA, EXTENDED_SCHEMA, FAILSAFE_SCHEMA, JSON_SCHEMA } from "./_yaml/schema/mod.ts";
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL3lhbWwudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbi8qKlxuICoge0BsaW5rY29kZSBwYXJzZX0gYW5kIHtAbGlua2NvZGUgc3RyaW5naWZ5fSBmb3IgaGFuZGxpbmdcbiAqIFtZQU1MXShodHRwczovL3lhbWwub3JnLykgZW5jb2RlZCBkYXRhLlxuICpcbiAqIFBvcnRlZCBmcm9tXG4gKiBbanMteWFtbCB2My4xMy4xXShodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvY29tbWl0LzY2NWFhZGRhNDIzNDlkY2FlODY5ZjEyMDQwZDliMTBlZjE4ZDEyZGEpXG4gKlxuICogSWYgeW91ciBZQU1MIGNvbnRhaW5zIG11bHRpcGxlIGRvY3VtZW50cyBpbiBpdCwgeW91IGNhbiB1c2Uge0BsaW5rY29kZSBwYXJzZUFsbH0gZm9yXG4gKiBoYW5kbGluZyBpdC5cbiAqXG4gKiBUbyBoYW5kbGUgYHJlZ2V4cGAsIGFuZCBgdW5kZWZpbmVkYCB0eXBlcywgdXNlIHtAbGlua2NvZGUgRVhURU5ERURfU0NIRU1BfS5cbiAqIFlvdSBjYW4gYWxzbyB1c2UgY3VzdG9tIHR5cGVzIGJ5IGV4dGVuZGluZyBzY2hlbWFzLlxuICpcbiAqICMjIDp3YXJuaW5nOiBMaW1pdGF0aW9uc1xuICogLSBgYmluYXJ5YCB0eXBlIGlzIGN1cnJlbnRseSBub3Qgc3RhYmxlLlxuICpcbiAqIEZvciBmdXJ0aGVyIGV4YW1wbGVzIHNlZSBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvdHJlZS9tYXN0ZXIvZXhhbXBsZXMuXG4gKiBAZXhhbXBsZVxuICogYGBgdHNcbiAqIGltcG9ydCB7XG4gKiAgIHBhcnNlLFxuICogICBzdHJpbmdpZnksXG4gKiB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2VuY29kaW5nL3lhbWwudHNcIjtcbiAqXG4gKiBjb25zdCBkYXRhID0gcGFyc2UoYFxuICogZm9vOiBiYXJcbiAqIGJhejpcbiAqICAgLSBxdXhcbiAqICAgLSBxdXV4XG4gKiBgKTtcbiAqIGNvbnNvbGUubG9nKGRhdGEpO1xuICogLy8gPT4geyBmb286IFwiYmFyXCIsIGJhejogWyBcInF1eFwiLCBcInF1dXhcIiBdIH1cbiAqXG4gKiBjb25zdCB5YW1sID0gc3RyaW5naWZ5KHsgZm9vOiBcImJhclwiLCBiYXo6IFtcInF1eFwiLCBcInF1dXhcIl0gfSk7XG4gKiBjb25zb2xlLmxvZyh5YW1sKTtcbiAqIC8vID0+XG4gKiAvLyBmb286IGJhclxuICogLy8gYmF6OlxuICogLy8gICAtIHF1eFxuICogLy8gICAtIHF1dXhcbiAqIGBgYFxuICpcbiAqIEBtb2R1bGVcbiAqL1xuXG5leHBvcnQgdHlwZSB7IFBhcnNlT3B0aW9ucyB9IGZyb20gXCIuL195YW1sL3BhcnNlLnRzXCI7XG5leHBvcnQgeyBwYXJzZSwgcGFyc2VBbGwgfSBmcm9tIFwiLi9feWFtbC9wYXJzZS50c1wiO1xuZXhwb3J0IHR5cGUgeyBEdW1wT3B0aW9ucyBhcyBTdHJpbmdpZnlPcHRpb25zIH0gZnJvbSBcIi4vX3lhbWwvc3RyaW5naWZ5LnRzXCI7XG5leHBvcnQgeyBzdHJpbmdpZnkgfSBmcm9tIFwiLi9feWFtbC9zdHJpbmdpZnkudHNcIjtcbmV4cG9ydCB0eXBlIHsgU2NoZW1hRGVmaW5pdGlvbiB9IGZyb20gXCIuL195YW1sL3NjaGVtYS50c1wiO1xuZXhwb3J0IHsgVHlwZSB9IGZyb20gXCIuL195YW1sL3R5cGUudHNcIjtcbmV4cG9ydCB0eXBlIHsgS2luZFR5cGUsIFJlcHJlc2VudEZuLCBTdHlsZVZhcmlhbnQgfSBmcm9tIFwiLi9feWFtbC90eXBlLnRzXCI7XG5leHBvcnQge1xuICBDT1JFX1NDSEVNQSxcbiAgREVGQVVMVF9TQ0hFTUEsXG4gIEVYVEVOREVEX1NDSEVNQSxcbiAgRkFJTFNBRkVfU0NIRU1BLFxuICBKU09OX1NDSEVNQSxcbn0gZnJvbSBcIi4vX3lhbWwvc2NoZW1hL21vZC50c1wiO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFFMUU7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0EyQ0MsR0FHRCxTQUFTLEtBQUssRUFBRSxRQUFRLFFBQVEsbUJBQW1CO0FBRW5ELFNBQVMsU0FBUyxRQUFRLHVCQUF1QjtBQUVqRCxTQUFTLElBQUksUUFBUSxrQkFBa0I7QUFFdkMsU0FDRSxXQUFXLEVBQ1gsY0FBYyxFQUNkLGVBQWUsRUFDZixlQUFlLEVBQ2YsV0FBVyxRQUNOLHdCQUF3QiJ9