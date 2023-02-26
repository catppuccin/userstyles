// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
const { hasOwn  } = Object;
const _toString = Object.prototype.toString;
function resolveYamlOmap(data) {
    const objectKeys = [];
    let pairKey = "";
    let pairHasKey = false;
    for (const pair of data){
        pairHasKey = false;
        if (_toString.call(pair) !== "[object Object]") return false;
        for(pairKey in pair){
            if (hasOwn(pair, pairKey)) {
                if (!pairHasKey) pairHasKey = true;
                else return false;
            }
        }
        if (!pairHasKey) return false;
        if (objectKeys.indexOf(pairKey) === -1) objectKeys.push(pairKey);
        else return false;
    }
    return true;
}
function constructYamlOmap(data) {
    return data !== null ? data : [];
}
export const omap = new Type("tag:yaml.org,2002:omap", {
    construct: constructYamlOmap,
    kind: "sequence",
    resolve: resolveYamlOmap
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL3R5cGUvb21hcC50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0ZWQgZnJvbSBqcy15YW1sIHYzLjEzLjE6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvY29tbWl0LzY2NWFhZGRhNDIzNDlkY2FlODY5ZjEyMDQwZDliMTBlZjE4ZDEyZGFcbi8vIENvcHlyaWdodCAyMDExLTIwMTUgYnkgVml0YWx5IFB1enJpbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBUeXBlIH0gZnJvbSBcIi4uL3R5cGUudHNcIjtcbmltcG9ydCB0eXBlIHsgQW55IH0gZnJvbSBcIi4uL3V0aWxzLnRzXCI7XG5cbmNvbnN0IHsgaGFzT3duIH0gPSBPYmplY3Q7XG5jb25zdCBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbE9tYXAoZGF0YTogQW55KTogYm9vbGVhbiB7XG4gIGNvbnN0IG9iamVjdEtleXM6IHN0cmluZ1tdID0gW107XG4gIGxldCBwYWlyS2V5ID0gXCJcIjtcbiAgbGV0IHBhaXJIYXNLZXkgPSBmYWxzZTtcblxuICBmb3IgKGNvbnN0IHBhaXIgb2YgZGF0YSkge1xuICAgIHBhaXJIYXNLZXkgPSBmYWxzZTtcblxuICAgIGlmIChfdG9TdHJpbmcuY2FsbChwYWlyKSAhPT0gXCJbb2JqZWN0IE9iamVjdF1cIikgcmV0dXJuIGZhbHNlO1xuXG4gICAgZm9yIChwYWlyS2V5IGluIHBhaXIpIHtcbiAgICAgIGlmIChoYXNPd24ocGFpciwgcGFpcktleSkpIHtcbiAgICAgICAgaWYgKCFwYWlySGFzS2V5KSBwYWlySGFzS2V5ID0gdHJ1ZTtcbiAgICAgICAgZWxzZSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKCFwYWlySGFzS2V5KSByZXR1cm4gZmFsc2U7XG5cbiAgICBpZiAob2JqZWN0S2V5cy5pbmRleE9mKHBhaXJLZXkpID09PSAtMSkgb2JqZWN0S2V5cy5wdXNoKHBhaXJLZXkpO1xuICAgIGVsc2UgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxPbWFwKGRhdGE6IEFueSk6IEFueSB7XG4gIHJldHVybiBkYXRhICE9PSBudWxsID8gZGF0YSA6IFtdO1xufVxuXG5leHBvcnQgY29uc3Qgb21hcCA9IG5ldyBUeXBlKFwidGFnOnlhbWwub3JnLDIwMDI6b21hcFwiLCB7XG4gIGNvbnN0cnVjdDogY29uc3RydWN0WWFtbE9tYXAsXG4gIGtpbmQ6IFwic2VxdWVuY2VcIixcbiAgcmVzb2x2ZTogcmVzb2x2ZVlhbWxPbWFwLFxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRTFFLFNBQVMsSUFBSSxRQUFRLGFBQWE7QUFHbEMsTUFBTSxFQUFFLE9BQU0sRUFBRSxHQUFHO0FBQ25CLE1BQU0sWUFBWSxPQUFPLFNBQVMsQ0FBQyxRQUFRO0FBRTNDLFNBQVMsZ0JBQWdCLElBQVMsRUFBVztJQUMzQyxNQUFNLGFBQXVCLEVBQUU7SUFDL0IsSUFBSSxVQUFVO0lBQ2QsSUFBSSxhQUFhLEtBQUs7SUFFdEIsS0FBSyxNQUFNLFFBQVEsS0FBTTtRQUN2QixhQUFhLEtBQUs7UUFFbEIsSUFBSSxVQUFVLElBQUksQ0FBQyxVQUFVLG1CQUFtQixPQUFPLEtBQUs7UUFFNUQsSUFBSyxXQUFXLEtBQU07WUFDcEIsSUFBSSxPQUFPLE1BQU0sVUFBVTtnQkFDekIsSUFBSSxDQUFDLFlBQVksYUFBYSxJQUFJO3FCQUM3QixPQUFPLEtBQUs7WUFDbkIsQ0FBQztRQUNIO1FBRUEsSUFBSSxDQUFDLFlBQVksT0FBTyxLQUFLO1FBRTdCLElBQUksV0FBVyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsV0FBVyxJQUFJLENBQUM7YUFDbkQsT0FBTyxLQUFLO0lBQ25CO0lBRUEsT0FBTyxJQUFJO0FBQ2I7QUFFQSxTQUFTLGtCQUFrQixJQUFTLEVBQU87SUFDekMsT0FBTyxTQUFTLElBQUksR0FBRyxPQUFPLEVBQUU7QUFDbEM7QUFFQSxPQUFPLE1BQU0sT0FBTyxJQUFJLEtBQUssMEJBQTBCO0lBQ3JELFdBQVc7SUFDWCxNQUFNO0lBQ04sU0FBUztBQUNYLEdBQUcifQ==