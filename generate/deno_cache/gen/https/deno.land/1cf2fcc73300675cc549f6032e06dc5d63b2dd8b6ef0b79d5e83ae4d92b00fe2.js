// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
import { SEP } from "./separator.ts";
/** Determines the common path from a set of paths, using an optional separator,
 * which defaults to the OS default separator.
 *
 * ```ts
 *       import { common } from "https://deno.land/std@$STD_VERSION/path/mod.ts";
 *       const p = common([
 *         "./deno/std/path/mod.ts",
 *         "./deno/std/fs/mod.ts",
 *       ]);
 *       console.log(p); // "./deno/std/"
 * ```
 */ export function common(paths, sep = SEP) {
    const [first = "", ...remaining] = paths;
    if (first === "" || remaining.length === 0) {
        return first.substring(0, first.lastIndexOf(sep) + 1);
    }
    const parts = first.split(sep);
    let endOfPrefix = parts.length;
    for (const path of remaining){
        const compare = path.split(sep);
        for(let i = 0; i < endOfPrefix; i++){
            if (compare[i] !== parts[i]) {
                endOfPrefix = i;
            }
        }
        if (endOfPrefix === 0) {
            return "";
        }
    }
    const prefix = parts.slice(0, endOfPrefix).join(sep);
    return prefix.endsWith(sep) ? prefix : `${prefix}${sep}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL3BhdGgvY29tbW9uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBUaGlzIG1vZHVsZSBpcyBicm93c2VyIGNvbXBhdGlibGUuXG5cbmltcG9ydCB7IFNFUCB9IGZyb20gXCIuL3NlcGFyYXRvci50c1wiO1xuXG4vKiogRGV0ZXJtaW5lcyB0aGUgY29tbW9uIHBhdGggZnJvbSBhIHNldCBvZiBwYXRocywgdXNpbmcgYW4gb3B0aW9uYWwgc2VwYXJhdG9yLFxuICogd2hpY2ggZGVmYXVsdHMgdG8gdGhlIE9TIGRlZmF1bHQgc2VwYXJhdG9yLlxuICpcbiAqIGBgYHRzXG4gKiAgICAgICBpbXBvcnQgeyBjb21tb24gfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9wYXRoL21vZC50c1wiO1xuICogICAgICAgY29uc3QgcCA9IGNvbW1vbihbXG4gKiAgICAgICAgIFwiLi9kZW5vL3N0ZC9wYXRoL21vZC50c1wiLFxuICogICAgICAgICBcIi4vZGVuby9zdGQvZnMvbW9kLnRzXCIsXG4gKiAgICAgICBdKTtcbiAqICAgICAgIGNvbnNvbGUubG9nKHApOyAvLyBcIi4vZGVuby9zdGQvXCJcbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29tbW9uKHBhdGhzOiBzdHJpbmdbXSwgc2VwID0gU0VQKTogc3RyaW5nIHtcbiAgY29uc3QgW2ZpcnN0ID0gXCJcIiwgLi4ucmVtYWluaW5nXSA9IHBhdGhzO1xuICBpZiAoZmlyc3QgPT09IFwiXCIgfHwgcmVtYWluaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybiBmaXJzdC5zdWJzdHJpbmcoMCwgZmlyc3QubGFzdEluZGV4T2Yoc2VwKSArIDEpO1xuICB9XG4gIGNvbnN0IHBhcnRzID0gZmlyc3Quc3BsaXQoc2VwKTtcblxuICBsZXQgZW5kT2ZQcmVmaXggPSBwYXJ0cy5sZW5ndGg7XG4gIGZvciAoY29uc3QgcGF0aCBvZiByZW1haW5pbmcpIHtcbiAgICBjb25zdCBjb21wYXJlID0gcGF0aC5zcGxpdChzZXApO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW5kT2ZQcmVmaXg7IGkrKykge1xuICAgICAgaWYgKGNvbXBhcmVbaV0gIT09IHBhcnRzW2ldKSB7XG4gICAgICAgIGVuZE9mUHJlZml4ID0gaTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoZW5kT2ZQcmVmaXggPT09IDApIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgfVxuICBjb25zdCBwcmVmaXggPSBwYXJ0cy5zbGljZSgwLCBlbmRPZlByZWZpeCkuam9pbihzZXApO1xuICByZXR1cm4gcHJlZml4LmVuZHNXaXRoKHNlcCkgPyBwcmVmaXggOiBgJHtwcmVmaXh9JHtzZXB9YDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDLFNBQVMsR0FBRyxRQUFRLGlCQUFpQjtBQUVyQzs7Ozs7Ozs7Ozs7Q0FXQyxHQUNELE9BQU8sU0FBUyxPQUFPLEtBQWUsRUFBRSxNQUFNLEdBQUcsRUFBVTtJQUN6RCxNQUFNLENBQUMsUUFBUSxFQUFFLEVBQUUsR0FBRyxVQUFVLEdBQUc7SUFDbkMsSUFBSSxVQUFVLE1BQU0sVUFBVSxNQUFNLEtBQUssR0FBRztRQUMxQyxPQUFPLE1BQU0sU0FBUyxDQUFDLEdBQUcsTUFBTSxXQUFXLENBQUMsT0FBTztJQUNyRCxDQUFDO0lBQ0QsTUFBTSxRQUFRLE1BQU0sS0FBSyxDQUFDO0lBRTFCLElBQUksY0FBYyxNQUFNLE1BQU07SUFDOUIsS0FBSyxNQUFNLFFBQVEsVUFBVztRQUM1QixNQUFNLFVBQVUsS0FBSyxLQUFLLENBQUM7UUFDM0IsSUFBSyxJQUFJLElBQUksR0FBRyxJQUFJLGFBQWEsSUFBSztZQUNwQyxJQUFJLE9BQU8sQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLEVBQUUsRUFBRTtnQkFDM0IsY0FBYztZQUNoQixDQUFDO1FBQ0g7UUFFQSxJQUFJLGdCQUFnQixHQUFHO1lBQ3JCLE9BQU87UUFDVCxDQUFDO0lBQ0g7SUFDQSxNQUFNLFNBQVMsTUFBTSxLQUFLLENBQUMsR0FBRyxhQUFhLElBQUksQ0FBQztJQUNoRCxPQUFPLE9BQU8sUUFBUSxDQUFDLE9BQU8sU0FBUyxDQUFDLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQztBQUMxRCxDQUFDIn0=