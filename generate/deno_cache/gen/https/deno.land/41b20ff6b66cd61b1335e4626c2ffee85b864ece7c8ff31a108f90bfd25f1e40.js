// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Concatenate the given arrays into a new Uint8Array.
 *
 * ```ts
 * import { concat } from "https://deno.land/std@$STD_VERSION/bytes/concat.ts";
 * const a = new Uint8Array([0, 1, 2]);
 * const b = new Uint8Array([3, 4, 5]);
 * console.log(concat(a, b)); // [0, 1, 2, 3, 4, 5]
 */ export function concat(...buf) {
    let length = 0;
    for (const b of buf){
        length += b.length;
    }
    const output = new Uint8Array(length);
    let index = 0;
    for (const b of buf){
        output.set(b, index);
        index += b.length;
    }
    return output;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2J5dGVzL2NvbmNhdC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gVGhpcyBtb2R1bGUgaXMgYnJvd3NlciBjb21wYXRpYmxlLlxuXG4vKiogQ29uY2F0ZW5hdGUgdGhlIGdpdmVuIGFycmF5cyBpbnRvIGEgbmV3IFVpbnQ4QXJyYXkuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNvbmNhdCB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2J5dGVzL2NvbmNhdC50c1wiO1xuICogY29uc3QgYSA9IG5ldyBVaW50OEFycmF5KFswLCAxLCAyXSk7XG4gKiBjb25zdCBiID0gbmV3IFVpbnQ4QXJyYXkoWzMsIDQsIDVdKTtcbiAqIGNvbnNvbGUubG9nKGNvbmNhdChhLCBiKSk7IC8vIFswLCAxLCAyLCAzLCA0LCA1XVxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uY2F0KC4uLmJ1ZjogVWludDhBcnJheVtdKTogVWludDhBcnJheSB7XG4gIGxldCBsZW5ndGggPSAwO1xuICBmb3IgKGNvbnN0IGIgb2YgYnVmKSB7XG4gICAgbGVuZ3RoICs9IGIubGVuZ3RoO1xuICB9XG5cbiAgY29uc3Qgb3V0cHV0ID0gbmV3IFVpbnQ4QXJyYXkobGVuZ3RoKTtcbiAgbGV0IGluZGV4ID0gMDtcbiAgZm9yIChjb25zdCBiIG9mIGJ1Zikge1xuICAgIG91dHB1dC5zZXQoYiwgaW5kZXgpO1xuICAgIGluZGV4ICs9IGIubGVuZ3RoO1xuICB9XG5cbiAgcmV0dXJuIG91dHB1dDtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwwRUFBMEU7QUFDMUUscUNBQXFDO0FBRXJDOzs7Ozs7O0NBT0MsR0FDRCxPQUFPLFNBQVMsT0FBTyxHQUFHLEdBQWlCLEVBQWM7SUFDdkQsSUFBSSxTQUFTO0lBQ2IsS0FBSyxNQUFNLEtBQUssSUFBSztRQUNuQixVQUFVLEVBQUUsTUFBTTtJQUNwQjtJQUVBLE1BQU0sU0FBUyxJQUFJLFdBQVc7SUFDOUIsSUFBSSxRQUFRO0lBQ1osS0FBSyxNQUFNLEtBQUssSUFBSztRQUNuQixPQUFPLEdBQUcsQ0FBQyxHQUFHO1FBQ2QsU0FBUyxFQUFFLE1BQU07SUFDbkI7SUFFQSxPQUFPO0FBQ1QsQ0FBQyJ9