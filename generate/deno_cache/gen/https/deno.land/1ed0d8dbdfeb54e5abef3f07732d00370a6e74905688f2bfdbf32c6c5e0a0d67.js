// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
function resolveYamlNull(data) {
    const max = data.length;
    return max === 1 && data === "~" || max === 4 && (data === "null" || data === "Null" || data === "NULL");
}
function constructYamlNull() {
    return null;
}
function isNull(object) {
    return object === null;
}
export const nil = new Type("tag:yaml.org,2002:null", {
    construct: constructYamlNull,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isNull,
    represent: {
        canonical () {
            return "~";
        },
        lowercase () {
            return "null";
        },
        uppercase () {
            return "NULL";
        },
        camelcase () {
            return "Null";
        }
    },
    resolve: resolveYamlNull
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL3R5cGUvbmlsLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IFR5cGUgfSBmcm9tIFwiLi4vdHlwZS50c1wiO1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbE51bGwoZGF0YTogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IG1heCA9IGRhdGEubGVuZ3RoO1xuXG4gIHJldHVybiAoXG4gICAgKG1heCA9PT0gMSAmJiBkYXRhID09PSBcIn5cIikgfHxcbiAgICAobWF4ID09PSA0ICYmIChkYXRhID09PSBcIm51bGxcIiB8fCBkYXRhID09PSBcIk51bGxcIiB8fCBkYXRhID09PSBcIk5VTExcIikpXG4gICk7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxOdWxsKCk6IG51bGwge1xuICByZXR1cm4gbnVsbDtcbn1cblxuZnVuY3Rpb24gaXNOdWxsKG9iamVjdDogdW5rbm93bik6IG9iamVjdCBpcyBudWxsIHtcbiAgcmV0dXJuIG9iamVjdCA9PT0gbnVsbDtcbn1cblxuZXhwb3J0IGNvbnN0IG5pbCA9IG5ldyBUeXBlKFwidGFnOnlhbWwub3JnLDIwMDI6bnVsbFwiLCB7XG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbE51bGwsXG4gIGRlZmF1bHRTdHlsZTogXCJsb3dlcmNhc2VcIixcbiAga2luZDogXCJzY2FsYXJcIixcbiAgcHJlZGljYXRlOiBpc051bGwsXG4gIHJlcHJlc2VudDoge1xuICAgIGNhbm9uaWNhbCgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIFwiflwiO1xuICAgIH0sXG4gICAgbG93ZXJjYXNlKCk6IHN0cmluZyB7XG4gICAgICByZXR1cm4gXCJudWxsXCI7XG4gICAgfSxcbiAgICB1cHBlcmNhc2UoKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBcIk5VTExcIjtcbiAgICB9LFxuICAgIGNhbWVsY2FzZSgpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIFwiTnVsbFwiO1xuICAgIH0sXG4gIH0sXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sTnVsbCxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSxTQUFTLElBQUksUUFBUSxhQUFhO0FBRWxDLFNBQVMsZ0JBQWdCLElBQVksRUFBVztJQUM5QyxNQUFNLE1BQU0sS0FBSyxNQUFNO0lBRXZCLE9BQ0UsQUFBQyxRQUFRLEtBQUssU0FBUyxPQUN0QixRQUFRLEtBQUssQ0FBQyxTQUFTLFVBQVUsU0FBUyxVQUFVLFNBQVMsTUFBTTtBQUV4RTtBQUVBLFNBQVMsb0JBQTBCO0lBQ2pDLE9BQU8sSUFBSTtBQUNiO0FBRUEsU0FBUyxPQUFPLE1BQWUsRUFBa0I7SUFDL0MsT0FBTyxXQUFXLElBQUk7QUFDeEI7QUFFQSxPQUFPLE1BQU0sTUFBTSxJQUFJLEtBQUssMEJBQTBCO0lBQ3BELFdBQVc7SUFDWCxjQUFjO0lBQ2QsTUFBTTtJQUNOLFdBQVc7SUFDWCxXQUFXO1FBQ1QsYUFBb0I7WUFDbEIsT0FBTztRQUNUO1FBQ0EsYUFBb0I7WUFDbEIsT0FBTztRQUNUO1FBQ0EsYUFBb0I7WUFDbEIsT0FBTztRQUNUO1FBQ0EsYUFBb0I7WUFDbEIsT0FBTztRQUNUO0lBQ0Y7SUFDQSxTQUFTO0FBQ1gsR0FBRyJ9