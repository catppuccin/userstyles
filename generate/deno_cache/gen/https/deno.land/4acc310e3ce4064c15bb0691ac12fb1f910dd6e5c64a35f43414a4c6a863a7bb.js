// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
import { isNegativeZero } from "../utils.ts";
const YAML_FLOAT_PATTERN = new RegExp(// 2.5e4, 2.5 and integers
"^(?:[-+]?(?:0|[1-9][0-9_]*)(?:\\.[0-9_]*)?(?:[eE][-+]?[0-9]+)?" + // .2e4, .2
// special case, seems not from spec
"|\\.[0-9_]+(?:[eE][-+]?[0-9]+)?" + // 20:59
"|[-+]?[0-9][0-9_]*(?::[0-5]?[0-9])+\\.[0-9_]*" + // .inf
"|[-+]?\\.(?:inf|Inf|INF)" + // .nan
"|\\.(?:nan|NaN|NAN))$");
function resolveYamlFloat(data) {
    if (!YAML_FLOAT_PATTERN.test(data) || // Quick hack to not allow integers end with `_`
    // Probably should update regexp & check speed
    data[data.length - 1] === "_") {
        return false;
    }
    return true;
}
function constructYamlFloat(data) {
    let value = data.replace(/_/g, "").toLowerCase();
    const sign = value[0] === "-" ? -1 : 1;
    const digits = [];
    if ("+-".indexOf(value[0]) >= 0) {
        value = value.slice(1);
    }
    if (value === ".inf") {
        return sign === 1 ? Number.POSITIVE_INFINITY : Number.NEGATIVE_INFINITY;
    }
    if (value === ".nan") {
        return NaN;
    }
    if (value.indexOf(":") >= 0) {
        value.split(":").forEach((v)=>{
            digits.unshift(parseFloat(v));
        });
        let valueNb = 0.0;
        let base = 1;
        digits.forEach((d)=>{
            valueNb += d * base;
            base *= 60;
        });
        return sign * valueNb;
    }
    return sign * parseFloat(value);
}
const SCIENTIFIC_WITHOUT_DOT = /^[-+]?[0-9]+e/;
function representYamlFloat(object, style) {
    if (isNaN(object)) {
        switch(style){
            case "lowercase":
                return ".nan";
            case "uppercase":
                return ".NAN";
            case "camelcase":
                return ".NaN";
        }
    } else if (Number.POSITIVE_INFINITY === object) {
        switch(style){
            case "lowercase":
                return ".inf";
            case "uppercase":
                return ".INF";
            case "camelcase":
                return ".Inf";
        }
    } else if (Number.NEGATIVE_INFINITY === object) {
        switch(style){
            case "lowercase":
                return "-.inf";
            case "uppercase":
                return "-.INF";
            case "camelcase":
                return "-.Inf";
        }
    } else if (isNegativeZero(object)) {
        return "-0.0";
    }
    const res = object.toString(10);
    // JS stringifier can build scientific format without dots: 5e-100,
    // while YAML requires dot: 5.e-100. Fix it with simple hack
    return SCIENTIFIC_WITHOUT_DOT.test(res) ? res.replace("e", ".e") : res;
}
function isFloat(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && (object % 1 !== 0 || isNegativeZero(object));
}
export const float = new Type("tag:yaml.org,2002:float", {
    construct: constructYamlFloat,
    defaultStyle: "lowercase",
    kind: "scalar",
    predicate: isFloat,
    represent: representYamlFloat,
    resolve: resolveYamlFloat
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL3R5cGUvZmxvYXQudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGZyb20ganMteWFtbCB2My4xMy4xOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9qcy15YW1sL2NvbW1pdC82NjVhYWRkYTQyMzQ5ZGNhZTg2OWYxMjA0MGQ5YjEwZWYxOGQxMmRhXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgU3R5bGVWYXJpYW50LCBUeXBlIH0gZnJvbSBcIi4uL3R5cGUudHNcIjtcbmltcG9ydCB7IEFueSwgaXNOZWdhdGl2ZVplcm8gfSBmcm9tIFwiLi4vdXRpbHMudHNcIjtcblxuY29uc3QgWUFNTF9GTE9BVF9QQVRURVJOID0gbmV3IFJlZ0V4cChcbiAgLy8gMi41ZTQsIDIuNSBhbmQgaW50ZWdlcnNcbiAgXCJeKD86Wy0rXT8oPzowfFsxLTldWzAtOV9dKikoPzpcXFxcLlswLTlfXSopPyg/OltlRV1bLStdP1swLTldKyk/XCIgK1xuICAgIC8vIC4yZTQsIC4yXG4gICAgLy8gc3BlY2lhbCBjYXNlLCBzZWVtcyBub3QgZnJvbSBzcGVjXG4gICAgXCJ8XFxcXC5bMC05X10rKD86W2VFXVstK10/WzAtOV0rKT9cIiArXG4gICAgLy8gMjA6NTlcbiAgICBcInxbLStdP1swLTldWzAtOV9dKig/OjpbMC01XT9bMC05XSkrXFxcXC5bMC05X10qXCIgK1xuICAgIC8vIC5pbmZcbiAgICBcInxbLStdP1xcXFwuKD86aW5mfEluZnxJTkYpXCIgK1xuICAgIC8vIC5uYW5cbiAgICBcInxcXFxcLig/Om5hbnxOYU58TkFOKSkkXCIsXG4pO1xuXG5mdW5jdGlvbiByZXNvbHZlWWFtbEZsb2F0KGRhdGE6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBpZiAoXG4gICAgIVlBTUxfRkxPQVRfUEFUVEVSTi50ZXN0KGRhdGEpIHx8XG4gICAgLy8gUXVpY2sgaGFjayB0byBub3QgYWxsb3cgaW50ZWdlcnMgZW5kIHdpdGggYF9gXG4gICAgLy8gUHJvYmFibHkgc2hvdWxkIHVwZGF0ZSByZWdleHAgJiBjaGVjayBzcGVlZFxuICAgIGRhdGFbZGF0YS5sZW5ndGggLSAxXSA9PT0gXCJfXCJcbiAgKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGNvbnN0cnVjdFlhbWxGbG9hdChkYXRhOiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgdmFsdWUgPSBkYXRhLnJlcGxhY2UoL18vZywgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgY29uc3Qgc2lnbiA9IHZhbHVlWzBdID09PSBcIi1cIiA/IC0xIDogMTtcbiAgY29uc3QgZGlnaXRzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGlmIChcIistXCIuaW5kZXhPZih2YWx1ZVswXSkgPj0gMCkge1xuICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMSk7XG4gIH1cblxuICBpZiAodmFsdWUgPT09IFwiLmluZlwiKSB7XG4gICAgcmV0dXJuIHNpZ24gPT09IDEgPyBOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgOiBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG4gIH1cbiAgaWYgKHZhbHVlID09PSBcIi5uYW5cIikge1xuICAgIHJldHVybiBOYU47XG4gIH1cbiAgaWYgKHZhbHVlLmluZGV4T2YoXCI6XCIpID49IDApIHtcbiAgICB2YWx1ZS5zcGxpdChcIjpcIikuZm9yRWFjaCgodikgPT4ge1xuICAgICAgZGlnaXRzLnVuc2hpZnQocGFyc2VGbG9hdCh2KSk7XG4gICAgfSk7XG5cbiAgICBsZXQgdmFsdWVOYiA9IDAuMDtcbiAgICBsZXQgYmFzZSA9IDE7XG5cbiAgICBkaWdpdHMuZm9yRWFjaCgoZCkgPT4ge1xuICAgICAgdmFsdWVOYiArPSBkICogYmFzZTtcbiAgICAgIGJhc2UgKj0gNjA7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2lnbiAqIHZhbHVlTmI7XG4gIH1cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUZsb2F0KHZhbHVlKTtcbn1cblxuY29uc3QgU0NJRU5USUZJQ19XSVRIT1VUX0RPVCA9IC9eWy0rXT9bMC05XStlLztcblxuZnVuY3Rpb24gcmVwcmVzZW50WWFtbEZsb2F0KG9iamVjdDogQW55LCBzdHlsZT86IFN0eWxlVmFyaWFudCk6IEFueSB7XG4gIGlmIChpc05hTihvYmplY3QpKSB7XG4gICAgc3dpdGNoIChzdHlsZSkge1xuICAgICAgY2FzZSBcImxvd2VyY2FzZVwiOlxuICAgICAgICByZXR1cm4gXCIubmFuXCI7XG4gICAgICBjYXNlIFwidXBwZXJjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi5OQU5cIjtcbiAgICAgIGNhc2UgXCJjYW1lbGNhc2VcIjpcbiAgICAgICAgcmV0dXJuIFwiLk5hTlwiO1xuICAgIH1cbiAgfSBlbHNlIGlmIChOdW1iZXIuUE9TSVRJVkVfSU5GSU5JVFkgPT09IG9iamVjdCkge1xuICAgIHN3aXRjaCAoc3R5bGUpIHtcbiAgICAgIGNhc2UgXCJsb3dlcmNhc2VcIjpcbiAgICAgICAgcmV0dXJuIFwiLmluZlwiO1xuICAgICAgY2FzZSBcInVwcGVyY2FzZVwiOlxuICAgICAgICByZXR1cm4gXCIuSU5GXCI7XG4gICAgICBjYXNlIFwiY2FtZWxjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi5JbmZcIjtcbiAgICB9XG4gIH0gZWxzZSBpZiAoTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZID09PSBvYmplY3QpIHtcbiAgICBzd2l0Y2ggKHN0eWxlKSB7XG4gICAgICBjYXNlIFwibG93ZXJjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi0uaW5mXCI7XG4gICAgICBjYXNlIFwidXBwZXJjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi0uSU5GXCI7XG4gICAgICBjYXNlIFwiY2FtZWxjYXNlXCI6XG4gICAgICAgIHJldHVybiBcIi0uSW5mXCI7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzTmVnYXRpdmVaZXJvKG9iamVjdCkpIHtcbiAgICByZXR1cm4gXCItMC4wXCI7XG4gIH1cblxuICBjb25zdCByZXMgPSBvYmplY3QudG9TdHJpbmcoMTApO1xuXG4gIC8vIEpTIHN0cmluZ2lmaWVyIGNhbiBidWlsZCBzY2llbnRpZmljIGZvcm1hdCB3aXRob3V0IGRvdHM6IDVlLTEwMCxcbiAgLy8gd2hpbGUgWUFNTCByZXF1aXJlcyBkb3Q6IDUuZS0xMDAuIEZpeCBpdCB3aXRoIHNpbXBsZSBoYWNrXG5cbiAgcmV0dXJuIFNDSUVOVElGSUNfV0lUSE9VVF9ET1QudGVzdChyZXMpID8gcmVzLnJlcGxhY2UoXCJlXCIsIFwiLmVcIikgOiByZXM7XG59XG5cbmZ1bmN0aW9uIGlzRmxvYXQob2JqZWN0OiBBbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gXCJbb2JqZWN0IE51bWJlcl1cIiAmJlxuICAgIChvYmplY3QgJSAxICE9PSAwIHx8IGlzTmVnYXRpdmVaZXJvKG9iamVjdCkpXG4gICk7XG59XG5cbmV4cG9ydCBjb25zdCBmbG9hdCA9IG5ldyBUeXBlKFwidGFnOnlhbWwub3JnLDIwMDI6ZmxvYXRcIiwge1xuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxGbG9hdCxcbiAgZGVmYXVsdFN0eWxlOiBcImxvd2VyY2FzZVwiLFxuICBraW5kOiBcInNjYWxhclwiLFxuICBwcmVkaWNhdGU6IGlzRmxvYXQsXG4gIHJlcHJlc2VudDogcmVwcmVzZW50WWFtbEZsb2F0LFxuICByZXNvbHZlOiByZXNvbHZlWWFtbEZsb2F0LFxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFB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