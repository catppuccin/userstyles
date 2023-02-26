// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
const _toString = Object.prototype.toString;
function resolveYamlPairs(data) {
    const result = Array.from({
        length: data.length
    });
    for(let index = 0; index < data.length; index++){
        const pair = data[index];
        if (_toString.call(pair) !== "[object Object]") return false;
        const keys = Object.keys(pair);
        if (keys.length !== 1) return false;
        result[index] = [
            keys[0],
            pair[keys[0]]
        ];
    }
    return true;
}
function constructYamlPairs(data) {
    if (data === null) return [];
    const result = Array.from({
        length: data.length
    });
    for(let index = 0; index < data.length; index += 1){
        const pair = data[index];
        const keys = Object.keys(pair);
        result[index] = [
            keys[0],
            pair[keys[0]]
        ];
    }
    return result;
}
export const pairs = new Type("tag:yaml.org,2002:pairs", {
    construct: constructYamlPairs,
    kind: "sequence",
    resolve: resolveYamlPairs
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL3R5cGUvcGFpcnMudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGZyb20ganMteWFtbCB2My4xMy4xOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9qcy15YW1sL2NvbW1pdC82NjVhYWRkYTQyMzQ5ZGNhZTg2OWYxMjA0MGQ5YjEwZWYxOGQxMmRhXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgVHlwZSB9IGZyb20gXCIuLi90eXBlLnRzXCI7XG5pbXBvcnQgdHlwZSB7IEFueSB9IGZyb20gXCIuLi91dGlscy50c1wiO1xuXG5jb25zdCBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbFBhaXJzKGRhdGE6IEFueVtdW10pOiBib29sZWFuIHtcbiAgY29uc3QgcmVzdWx0ID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogZGF0YS5sZW5ndGggfSk7XG5cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGRhdGEubGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgY29uc3QgcGFpciA9IGRhdGFbaW5kZXhdO1xuXG4gICAgaWYgKF90b1N0cmluZy5jYWxsKHBhaXIpICE9PSBcIltvYmplY3QgT2JqZWN0XVwiKSByZXR1cm4gZmFsc2U7XG5cbiAgICBjb25zdCBrZXlzID0gT2JqZWN0LmtleXMocGFpcik7XG5cbiAgICBpZiAoa2V5cy5sZW5ndGggIT09IDEpIHJldHVybiBmYWxzZTtcblxuICAgIHJlc3VsdFtpbmRleF0gPSBba2V5c1swXSwgcGFpcltrZXlzWzBdIGFzIEFueV1dO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxQYWlycyhkYXRhOiBzdHJpbmcpOiBBbnlbXSB7XG4gIGlmIChkYXRhID09PSBudWxsKSByZXR1cm4gW107XG5cbiAgY29uc3QgcmVzdWx0ID0gQXJyYXkuZnJvbSh7IGxlbmd0aDogZGF0YS5sZW5ndGggfSk7XG5cbiAgZm9yIChsZXQgaW5kZXggPSAwOyBpbmRleCA8IGRhdGEubGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgY29uc3QgcGFpciA9IGRhdGFbaW5kZXhdO1xuXG4gICAgY29uc3Qga2V5cyA9IE9iamVjdC5rZXlzKHBhaXIpO1xuXG4gICAgcmVzdWx0W2luZGV4XSA9IFtrZXlzWzBdLCBwYWlyW2tleXNbMF0gYXMgQW55XV07XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG5leHBvcnQgY29uc3QgcGFpcnMgPSBuZXcgVHlwZShcInRhZzp5YW1sLm9yZywyMDAyOnBhaXJzXCIsIHtcbiAgY29uc3RydWN0OiBjb25zdHJ1Y3RZYW1sUGFpcnMsXG4gIGtpbmQ6IFwic2VxdWVuY2VcIixcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxQYWlycyxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSxTQUFTLElBQUksUUFBUSxhQUFhO0FBR2xDLE1BQU0sWUFBWSxPQUFPLFNBQVMsQ0FBQyxRQUFRO0FBRTNDLFNBQVMsaUJBQWlCLElBQWEsRUFBVztJQUNoRCxNQUFNLFNBQVMsTUFBTSxJQUFJLENBQUM7UUFBRSxRQUFRLEtBQUssTUFBTTtJQUFDO0lBRWhELElBQUssSUFBSSxRQUFRLEdBQUcsUUFBUSxLQUFLLE1BQU0sRUFBRSxRQUFTO1FBQ2hELE1BQU0sT0FBTyxJQUFJLENBQUMsTUFBTTtRQUV4QixJQUFJLFVBQVUsSUFBSSxDQUFDLFVBQVUsbUJBQW1CLE9BQU8sS0FBSztRQUU1RCxNQUFNLE9BQU8sT0FBTyxJQUFJLENBQUM7UUFFekIsSUFBSSxLQUFLLE1BQU0sS0FBSyxHQUFHLE9BQU8sS0FBSztRQUVuQyxNQUFNLENBQUMsTUFBTSxHQUFHO1lBQUMsSUFBSSxDQUFDLEVBQUU7WUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBUTtTQUFDO0lBQ2pEO0lBRUEsT0FBTyxJQUFJO0FBQ2I7QUFFQSxTQUFTLG1CQUFtQixJQUFZLEVBQVM7SUFDL0MsSUFBSSxTQUFTLElBQUksRUFBRSxPQUFPLEVBQUU7SUFFNUIsTUFBTSxTQUFTLE1BQU0sSUFBSSxDQUFDO1FBQUUsUUFBUSxLQUFLLE1BQU07SUFBQztJQUVoRCxJQUFLLElBQUksUUFBUSxHQUFHLFFBQVEsS0FBSyxNQUFNLEVBQUUsU0FBUyxFQUFHO1FBQ25ELE1BQU0sT0FBTyxJQUFJLENBQUMsTUFBTTtRQUV4QixNQUFNLE9BQU8sT0FBTyxJQUFJLENBQUM7UUFFekIsTUFBTSxDQUFDLE1BQU0sR0FBRztZQUFDLElBQUksQ0FBQyxFQUFFO1lBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQVE7U0FBQztJQUNqRDtJQUVBLE9BQU87QUFDVDtBQUVBLE9BQU8sTUFBTSxRQUFRLElBQUksS0FBSywyQkFBMkI7SUFDdkQsV0FBVztJQUNYLE1BQU07SUFDTixTQUFTO0FBQ1gsR0FBRyJ9