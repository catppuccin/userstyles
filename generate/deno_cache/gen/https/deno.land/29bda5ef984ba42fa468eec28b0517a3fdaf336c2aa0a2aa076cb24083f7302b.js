// Ported and adapted from js-yaml-js-types v1.0.0:
// https://github.com/nodeca/js-yaml-js-types/tree/ac537e7bbdd3c2cbbd9882ca3919c520c2dc022b
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
// Note: original implementation used Esprima to handle functions
// To avoid dependencies, we'll just try to check if we can construct a function from given string
function reconstructFunction(code) {
    const func = new Function(`return ${code}`)();
    if (!(func instanceof Function)) {
        throw new TypeError(`Expected function but got ${typeof func}: ${code}`);
    }
    return func;
}
export const func = new Type("tag:yaml.org,2002:js/function", {
    kind: "scalar",
    resolve (data) {
        if (data === null) {
            return false;
        }
        try {
            reconstructFunction(`${data}`);
            return true;
        } catch (_err) {
            return false;
        }
    },
    construct (data) {
        return reconstructFunction(data);
    },
    predicate (object) {
        return object instanceof Function;
    },
    represent (object) {
        return object.toString();
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL3R5cGUvZnVuY3Rpb24udHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGFuZCBhZGFwdGVkIGZyb20ganMteWFtbC1qcy10eXBlcyB2MS4wLjA6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwtanMtdHlwZXMvdHJlZS9hYzUzN2U3YmJkZDNjMmNiYmQ5ODgyY2EzOTE5YzUyMGMyZGMwMjJiXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgVHlwZSB9IGZyb20gXCIuLi90eXBlLnRzXCI7XG5pbXBvcnQgdHlwZSB7IEFueSB9IGZyb20gXCIuLi91dGlscy50c1wiO1xuXG4vLyBOb3RlOiBvcmlnaW5hbCBpbXBsZW1lbnRhdGlvbiB1c2VkIEVzcHJpbWEgdG8gaGFuZGxlIGZ1bmN0aW9uc1xuLy8gVG8gYXZvaWQgZGVwZW5kZW5jaWVzLCB3ZSdsbCBqdXN0IHRyeSB0byBjaGVjayBpZiB3ZSBjYW4gY29uc3RydWN0IGEgZnVuY3Rpb24gZnJvbSBnaXZlbiBzdHJpbmdcbmZ1bmN0aW9uIHJlY29uc3RydWN0RnVuY3Rpb24oY29kZTogc3RyaW5nKSB7XG4gIGNvbnN0IGZ1bmMgPSBuZXcgRnVuY3Rpb24oYHJldHVybiAke2NvZGV9YCkoKTtcbiAgaWYgKCEoZnVuYyBpbnN0YW5jZW9mIEZ1bmN0aW9uKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEV4cGVjdGVkIGZ1bmN0aW9uIGJ1dCBnb3QgJHt0eXBlb2YgZnVuY306ICR7Y29kZX1gKTtcbiAgfVxuICByZXR1cm4gZnVuYztcbn1cblxuZXhwb3J0IGNvbnN0IGZ1bmMgPSBuZXcgVHlwZShcInRhZzp5YW1sLm9yZywyMDAyOmpzL2Z1bmN0aW9uXCIsIHtcbiAga2luZDogXCJzY2FsYXJcIixcbiAgcmVzb2x2ZShkYXRhOiBBbnkpIHtcbiAgICBpZiAoZGF0YSA9PT0gbnVsbCkge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB0cnkge1xuICAgICAgcmVjb25zdHJ1Y3RGdW5jdGlvbihgJHtkYXRhfWApO1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBjYXRjaCAoX2Vycikge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSxcbiAgY29uc3RydWN0KGRhdGE6IHN0cmluZykge1xuICAgIHJldHVybiByZWNvbnN0cnVjdEZ1bmN0aW9uKGRhdGEpO1xuICB9LFxuICBwcmVkaWNhdGUob2JqZWN0OiB1bmtub3duKSB7XG4gICAgcmV0dXJuIG9iamVjdCBpbnN0YW5jZW9mIEZ1bmN0aW9uO1xuICB9LFxuICByZXByZXNlbnQob2JqZWN0OiAoLi4uYXJnczogQW55W10pID0+IEFueSkge1xuICAgIHJldHVybiBvYmplY3QudG9TdHJpbmcoKTtcbiAgfSxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLG1EQUFtRDtBQUNuRCwyRkFBMkY7QUFDM0YsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSxTQUFTLElBQUksUUFBUSxhQUFhO0FBR2xDLGlFQUFpRTtBQUNqRSxrR0FBa0c7QUFDbEcsU0FBUyxvQkFBb0IsSUFBWSxFQUFFO0lBQ3pDLE1BQU0sT0FBTyxJQUFJLFNBQVMsQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDO0lBQzFDLElBQUksQ0FBQyxDQUFDLGdCQUFnQixRQUFRLEdBQUc7UUFDL0IsTUFBTSxJQUFJLFVBQVUsQ0FBQywwQkFBMEIsRUFBRSxPQUFPLEtBQUssRUFBRSxFQUFFLEtBQUssQ0FBQyxFQUFFO0lBQzNFLENBQUM7SUFDRCxPQUFPO0FBQ1Q7QUFFQSxPQUFPLE1BQU0sT0FBTyxJQUFJLEtBQUssaUNBQWlDO0lBQzVELE1BQU07SUFDTixTQUFRLElBQVMsRUFBRTtRQUNqQixJQUFJLFNBQVMsSUFBSSxFQUFFO1lBQ2pCLE9BQU8sS0FBSztRQUNkLENBQUM7UUFDRCxJQUFJO1lBQ0Ysb0JBQW9CLENBQUMsRUFBRSxLQUFLLENBQUM7WUFDN0IsT0FBTyxJQUFJO1FBQ2IsRUFBRSxPQUFPLE1BQU07WUFDYixPQUFPLEtBQUs7UUFDZDtJQUNGO0lBQ0EsV0FBVSxJQUFZLEVBQUU7UUFDdEIsT0FBTyxvQkFBb0I7SUFDN0I7SUFDQSxXQUFVLE1BQWUsRUFBRTtRQUN6QixPQUFPLGtCQUFrQjtJQUMzQjtJQUNBLFdBQVUsTUFBK0IsRUFBRTtRQUN6QyxPQUFPLE9BQU8sUUFBUTtJQUN4QjtBQUNGLEdBQUcifQ==