// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
// This module is browser compatible.
/** Copy bytes from the `src` array to the `dst` array. Returns the number of
 * bytes copied.
 *
 * If the `src` array is larger than what the `dst` array can hold, only the
 * amount of bytes that fit in the `dst` array are copied.
 *
 * An offset can be specified as the third argument that begins the copy at
 * that given index in the `dst` array. The offset defaults to the beginning of
 * the array.
 *
 * ```ts
 * import { copy } from "https://deno.land/std@$STD_VERSION/bytes/copy.ts";
 * const src = new Uint8Array([9, 8, 7]);
 * const dst = new Uint8Array([0, 1, 2, 3, 4, 5]);
 * console.log(copy(src, dst)); // 3
 * console.log(dst); // [9, 8, 7, 3, 4, 5]
 * ```
 *
 * ```ts
 * import { copy } from "https://deno.land/std@$STD_VERSION/bytes/copy.ts";
 * const src = new Uint8Array([1, 1, 1, 1]);
 * const dst = new Uint8Array([0, 0, 0, 0]);
 * console.log(copy(src, dst, 1)); // 3
 * console.log(dst); // [0, 1, 1, 1]
 * ```
 */ export function copy(src, dst, off = 0) {
    off = Math.max(0, Math.min(off, dst.byteLength));
    const dstBytesAvailable = dst.byteLength - off;
    if (src.byteLength > dstBytesAvailable) {
        src = src.subarray(0, dstBytesAvailable);
    }
    dst.set(src, off);
    return src.byteLength;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2J5dGVzL2NvcHkudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIFRoaXMgbW9kdWxlIGlzIGJyb3dzZXIgY29tcGF0aWJsZS5cblxuLyoqIENvcHkgYnl0ZXMgZnJvbSB0aGUgYHNyY2AgYXJyYXkgdG8gdGhlIGBkc3RgIGFycmF5LiBSZXR1cm5zIHRoZSBudW1iZXIgb2ZcbiAqIGJ5dGVzIGNvcGllZC5cbiAqXG4gKiBJZiB0aGUgYHNyY2AgYXJyYXkgaXMgbGFyZ2VyIHRoYW4gd2hhdCB0aGUgYGRzdGAgYXJyYXkgY2FuIGhvbGQsIG9ubHkgdGhlXG4gKiBhbW91bnQgb2YgYnl0ZXMgdGhhdCBmaXQgaW4gdGhlIGBkc3RgIGFycmF5IGFyZSBjb3BpZWQuXG4gKlxuICogQW4gb2Zmc2V0IGNhbiBiZSBzcGVjaWZpZWQgYXMgdGhlIHRoaXJkIGFyZ3VtZW50IHRoYXQgYmVnaW5zIHRoZSBjb3B5IGF0XG4gKiB0aGF0IGdpdmVuIGluZGV4IGluIHRoZSBgZHN0YCBhcnJheS4gVGhlIG9mZnNldCBkZWZhdWx0cyB0byB0aGUgYmVnaW5uaW5nIG9mXG4gKiB0aGUgYXJyYXkuXG4gKlxuICogYGBgdHNcbiAqIGltcG9ydCB7IGNvcHkgfSBmcm9tIFwiaHR0cHM6Ly9kZW5vLmxhbmQvc3RkQCRTVERfVkVSU0lPTi9ieXRlcy9jb3B5LnRzXCI7XG4gKiBjb25zdCBzcmMgPSBuZXcgVWludDhBcnJheShbOSwgOCwgN10pO1xuICogY29uc3QgZHN0ID0gbmV3IFVpbnQ4QXJyYXkoWzAsIDEsIDIsIDMsIDQsIDVdKTtcbiAqIGNvbnNvbGUubG9nKGNvcHkoc3JjLCBkc3QpKTsgLy8gM1xuICogY29uc29sZS5sb2coZHN0KTsgLy8gWzksIDgsIDcsIDMsIDQsIDVdXG4gKiBgYGBcbiAqXG4gKiBgYGB0c1xuICogaW1wb3J0IHsgY29weSB9IGZyb20gXCJodHRwczovL2Rlbm8ubGFuZC9zdGRAJFNURF9WRVJTSU9OL2J5dGVzL2NvcHkudHNcIjtcbiAqIGNvbnN0IHNyYyA9IG5ldyBVaW50OEFycmF5KFsxLCAxLCAxLCAxXSk7XG4gKiBjb25zdCBkc3QgPSBuZXcgVWludDhBcnJheShbMCwgMCwgMCwgMF0pO1xuICogY29uc29sZS5sb2coY29weShzcmMsIGRzdCwgMSkpOyAvLyAzXG4gKiBjb25zb2xlLmxvZyhkc3QpOyAvLyBbMCwgMSwgMSwgMV1cbiAqIGBgYFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShzcmM6IFVpbnQ4QXJyYXksIGRzdDogVWludDhBcnJheSwgb2ZmID0gMCk6IG51bWJlciB7XG4gIG9mZiA9IE1hdGgubWF4KDAsIE1hdGgubWluKG9mZiwgZHN0LmJ5dGVMZW5ndGgpKTtcbiAgY29uc3QgZHN0Qnl0ZXNBdmFpbGFibGUgPSBkc3QuYnl0ZUxlbmd0aCAtIG9mZjtcbiAgaWYgKHNyYy5ieXRlTGVuZ3RoID4gZHN0Qnl0ZXNBdmFpbGFibGUpIHtcbiAgICBzcmMgPSBzcmMuc3ViYXJyYXkoMCwgZHN0Qnl0ZXNBdmFpbGFibGUpO1xuICB9XG4gIGRzdC5zZXQoc3JjLCBvZmYpO1xuICByZXR1cm4gc3JjLmJ5dGVMZW5ndGg7XG59XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsMEVBQTBFO0FBQzFFLHFDQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQXlCQyxHQUNELE9BQU8sU0FBUyxLQUFLLEdBQWUsRUFBRSxHQUFlLEVBQUUsTUFBTSxDQUFDLEVBQVU7SUFDdEUsTUFBTSxLQUFLLEdBQUcsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDLEtBQUssSUFBSSxVQUFVO0lBQzlDLE1BQU0sb0JBQW9CLElBQUksVUFBVSxHQUFHO0lBQzNDLElBQUksSUFBSSxVQUFVLEdBQUcsbUJBQW1CO1FBQ3RDLE1BQU0sSUFBSSxRQUFRLENBQUMsR0FBRztJQUN4QixDQUFDO0lBQ0QsSUFBSSxHQUFHLENBQUMsS0FBSztJQUNiLE9BQU8sSUFBSSxVQUFVO0FBQ3ZCLENBQUMifQ==