// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { Type } from "../type.ts";
import { isNegativeZero } from "../utils.ts";
function isHexCode(c) {
    return 0x30 <= /* 0 */ c && c <= 0x39 || 0x41 <= /* A */ c && c <= 0x46 || 0x61 <= /* a */ c && c <= 0x66;
}
function isOctCode(c) {
    return 0x30 <= /* 0 */ c && c <= 0x37 /* 7 */ ;
}
function isDecCode(c) {
    return 0x30 <= /* 0 */ c && c <= 0x39 /* 9 */ ;
}
function resolveYamlInteger(data) {
    const max = data.length;
    let index = 0;
    let hasDigits = false;
    if (!max) return false;
    let ch = data[index];
    // sign
    if (ch === "-" || ch === "+") {
        ch = data[++index];
    }
    if (ch === "0") {
        // 0
        if (index + 1 === max) return true;
        ch = data[++index];
        // base 2, base 8, base 16
        if (ch === "b") {
            // base 2
            index++;
            for(; index < max; index++){
                ch = data[index];
                if (ch === "_") continue;
                if (ch !== "0" && ch !== "1") return false;
                hasDigits = true;
            }
            return hasDigits && ch !== "_";
        }
        if (ch === "x") {
            // base 16
            index++;
            for(; index < max; index++){
                ch = data[index];
                if (ch === "_") continue;
                if (!isHexCode(data.charCodeAt(index))) return false;
                hasDigits = true;
            }
            return hasDigits && ch !== "_";
        }
        // base 8
        for(; index < max; index++){
            ch = data[index];
            if (ch === "_") continue;
            if (!isOctCode(data.charCodeAt(index))) return false;
            hasDigits = true;
        }
        return hasDigits && ch !== "_";
    }
    // base 10 (except 0) or base 60
    // value should not start with `_`;
    if (ch === "_") return false;
    for(; index < max; index++){
        ch = data[index];
        if (ch === "_") continue;
        if (ch === ":") break;
        if (!isDecCode(data.charCodeAt(index))) {
            return false;
        }
        hasDigits = true;
    }
    // Should have digits and should not end with `_`
    if (!hasDigits || ch === "_") return false;
    // if !base60 - done;
    if (ch !== ":") return true;
    // base60 almost not used, no needs to optimize
    return /^(:[0-5]?[0-9])+$/.test(data.slice(index));
}
function constructYamlInteger(data) {
    let value = data;
    const digits = [];
    if (value.indexOf("_") !== -1) {
        value = value.replace(/_/g, "");
    }
    let sign = 1;
    let ch = value[0];
    if (ch === "-" || ch === "+") {
        if (ch === "-") sign = -1;
        value = value.slice(1);
        ch = value[0];
    }
    if (value === "0") return 0;
    if (ch === "0") {
        if (value[1] === "b") return sign * parseInt(value.slice(2), 2);
        if (value[1] === "x") return sign * parseInt(value, 16);
        return sign * parseInt(value, 8);
    }
    if (value.indexOf(":") !== -1) {
        value.split(":").forEach((v)=>{
            digits.unshift(parseInt(v, 10));
        });
        let valueInt = 0;
        let base = 1;
        digits.forEach((d)=>{
            valueInt += d * base;
            base *= 60;
        });
        return sign * valueInt;
    }
    return sign * parseInt(value, 10);
}
function isInteger(object) {
    return Object.prototype.toString.call(object) === "[object Number]" && object % 1 === 0 && !isNegativeZero(object);
}
export const int = new Type("tag:yaml.org,2002:int", {
    construct: constructYamlInteger,
    defaultStyle: "decimal",
    kind: "scalar",
    predicate: isInteger,
    represent: {
        binary (obj) {
            return obj >= 0 ? `0b${obj.toString(2)}` : `-0b${obj.toString(2).slice(1)}`;
        },
        octal (obj) {
            return obj >= 0 ? `0${obj.toString(8)}` : `-0${obj.toString(8).slice(1)}`;
        },
        decimal (obj) {
            return obj.toString(10);
        },
        hexadecimal (obj) {
            return obj >= 0 ? `0x${obj.toString(16).toUpperCase()}` : `-0x${obj.toString(16).toUpperCase().slice(1)}`;
        }
    },
    resolve: resolveYamlInteger,
    styleAliases: {
        binary: [
            2,
            "bin"
        ],
        decimal: [
            10,
            "dec"
        ],
        hexadecimal: [
            16,
            "hex"
        ],
        octal: [
            8,
            "oct"
        ]
    }
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL3R5cGUvaW50LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IFR5cGUgfSBmcm9tIFwiLi4vdHlwZS50c1wiO1xuaW1wb3J0IHsgQW55LCBpc05lZ2F0aXZlWmVybyB9IGZyb20gXCIuLi91dGlscy50c1wiO1xuXG5mdW5jdGlvbiBpc0hleENvZGUoYzogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAoXG4gICAgKDB4MzAgPD0gLyogMCAqLyBjICYmIGMgPD0gMHgzOSkgLyogOSAqLyB8fFxuICAgICgweDQxIDw9IC8qIEEgKi8gYyAmJiBjIDw9IDB4NDYpIC8qIEYgKi8gfHxcbiAgICAoMHg2MSA8PSAvKiBhICovIGMgJiYgYyA8PSAweDY2KSAvKiBmICovXG4gICk7XG59XG5cbmZ1bmN0aW9uIGlzT2N0Q29kZShjOiBudW1iZXIpOiBib29sZWFuIHtcbiAgcmV0dXJuIDB4MzAgPD0gLyogMCAqLyBjICYmIGMgPD0gMHgzNyAvKiA3ICovO1xufVxuXG5mdW5jdGlvbiBpc0RlY0NvZGUoYzogbnVtYmVyKTogYm9vbGVhbiB7XG4gIHJldHVybiAweDMwIDw9IC8qIDAgKi8gYyAmJiBjIDw9IDB4MzkgLyogOSAqLztcbn1cblxuZnVuY3Rpb24gcmVzb2x2ZVlhbWxJbnRlZ2VyKGRhdGE6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBtYXggPSBkYXRhLmxlbmd0aDtcbiAgbGV0IGluZGV4ID0gMDtcbiAgbGV0IGhhc0RpZ2l0cyA9IGZhbHNlO1xuXG4gIGlmICghbWF4KSByZXR1cm4gZmFsc2U7XG5cbiAgbGV0IGNoID0gZGF0YVtpbmRleF07XG5cbiAgLy8gc2lnblxuICBpZiAoY2ggPT09IFwiLVwiIHx8IGNoID09PSBcIitcIikge1xuICAgIGNoID0gZGF0YVsrK2luZGV4XTtcbiAgfVxuXG4gIGlmIChjaCA9PT0gXCIwXCIpIHtcbiAgICAvLyAwXG4gICAgaWYgKGluZGV4ICsgMSA9PT0gbWF4KSByZXR1cm4gdHJ1ZTtcbiAgICBjaCA9IGRhdGFbKytpbmRleF07XG5cbiAgICAvLyBiYXNlIDIsIGJhc2UgOCwgYmFzZSAxNlxuXG4gICAgaWYgKGNoID09PSBcImJcIikge1xuICAgICAgLy8gYmFzZSAyXG4gICAgICBpbmRleCsrO1xuXG4gICAgICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICAgICAgY2ggPSBkYXRhW2luZGV4XTtcbiAgICAgICAgaWYgKGNoID09PSBcIl9cIikgY29udGludWU7XG4gICAgICAgIGlmIChjaCAhPT0gXCIwXCIgJiYgY2ggIT09IFwiMVwiKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGhhc0RpZ2l0cyA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzRGlnaXRzICYmIGNoICE9PSBcIl9cIjtcbiAgICB9XG5cbiAgICBpZiAoY2ggPT09IFwieFwiKSB7XG4gICAgICAvLyBiYXNlIDE2XG4gICAgICBpbmRleCsrO1xuXG4gICAgICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICAgICAgY2ggPSBkYXRhW2luZGV4XTtcbiAgICAgICAgaWYgKGNoID09PSBcIl9cIikgY29udGludWU7XG4gICAgICAgIGlmICghaXNIZXhDb2RlKGRhdGEuY2hhckNvZGVBdChpbmRleCkpKSByZXR1cm4gZmFsc2U7XG4gICAgICAgIGhhc0RpZ2l0cyA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gaGFzRGlnaXRzICYmIGNoICE9PSBcIl9cIjtcbiAgICB9XG5cbiAgICAvLyBiYXNlIDhcbiAgICBmb3IgKDsgaW5kZXggPCBtYXg7IGluZGV4KyspIHtcbiAgICAgIGNoID0gZGF0YVtpbmRleF07XG4gICAgICBpZiAoY2ggPT09IFwiX1wiKSBjb250aW51ZTtcbiAgICAgIGlmICghaXNPY3RDb2RlKGRhdGEuY2hhckNvZGVBdChpbmRleCkpKSByZXR1cm4gZmFsc2U7XG4gICAgICBoYXNEaWdpdHMgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gaGFzRGlnaXRzICYmIGNoICE9PSBcIl9cIjtcbiAgfVxuXG4gIC8vIGJhc2UgMTAgKGV4Y2VwdCAwKSBvciBiYXNlIDYwXG5cbiAgLy8gdmFsdWUgc2hvdWxkIG5vdCBzdGFydCB3aXRoIGBfYDtcbiAgaWYgKGNoID09PSBcIl9cIikgcmV0dXJuIGZhbHNlO1xuXG4gIGZvciAoOyBpbmRleCA8IG1heDsgaW5kZXgrKykge1xuICAgIGNoID0gZGF0YVtpbmRleF07XG4gICAgaWYgKGNoID09PSBcIl9cIikgY29udGludWU7XG4gICAgaWYgKGNoID09PSBcIjpcIikgYnJlYWs7XG4gICAgaWYgKCFpc0RlY0NvZGUoZGF0YS5jaGFyQ29kZUF0KGluZGV4KSkpIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgaGFzRGlnaXRzID0gdHJ1ZTtcbiAgfVxuXG4gIC8vIFNob3VsZCBoYXZlIGRpZ2l0cyBhbmQgc2hvdWxkIG5vdCBlbmQgd2l0aCBgX2BcbiAgaWYgKCFoYXNEaWdpdHMgfHwgY2ggPT09IFwiX1wiKSByZXR1cm4gZmFsc2U7XG5cbiAgLy8gaWYgIWJhc2U2MCAtIGRvbmU7XG4gIGlmIChjaCAhPT0gXCI6XCIpIHJldHVybiB0cnVlO1xuXG4gIC8vIGJhc2U2MCBhbG1vc3Qgbm90IHVzZWQsIG5vIG5lZWRzIHRvIG9wdGltaXplXG4gIHJldHVybiAvXig6WzAtNV0/WzAtOV0pKyQvLnRlc3QoZGF0YS5zbGljZShpbmRleCkpO1xufVxuXG5mdW5jdGlvbiBjb25zdHJ1Y3RZYW1sSW50ZWdlcihkYXRhOiBzdHJpbmcpOiBudW1iZXIge1xuICBsZXQgdmFsdWUgPSBkYXRhO1xuICBjb25zdCBkaWdpdHM6IG51bWJlcltdID0gW107XG5cbiAgaWYgKHZhbHVlLmluZGV4T2YoXCJfXCIpICE9PSAtMSkge1xuICAgIHZhbHVlID0gdmFsdWUucmVwbGFjZSgvXy9nLCBcIlwiKTtcbiAgfVxuXG4gIGxldCBzaWduID0gMTtcbiAgbGV0IGNoID0gdmFsdWVbMF07XG4gIGlmIChjaCA9PT0gXCItXCIgfHwgY2ggPT09IFwiK1wiKSB7XG4gICAgaWYgKGNoID09PSBcIi1cIikgc2lnbiA9IC0xO1xuICAgIHZhbHVlID0gdmFsdWUuc2xpY2UoMSk7XG4gICAgY2ggPSB2YWx1ZVswXTtcbiAgfVxuXG4gIGlmICh2YWx1ZSA9PT0gXCIwXCIpIHJldHVybiAwO1xuXG4gIGlmIChjaCA9PT0gXCIwXCIpIHtcbiAgICBpZiAodmFsdWVbMV0gPT09IFwiYlwiKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLnNsaWNlKDIpLCAyKTtcbiAgICBpZiAodmFsdWVbMV0gPT09IFwieFwiKSByZXR1cm4gc2lnbiAqIHBhcnNlSW50KHZhbHVlLCAxNik7XG4gICAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgOCk7XG4gIH1cblxuICBpZiAodmFsdWUuaW5kZXhPZihcIjpcIikgIT09IC0xKSB7XG4gICAgdmFsdWUuc3BsaXQoXCI6XCIpLmZvckVhY2goKHYpID0+IHtcbiAgICAgIGRpZ2l0cy51bnNoaWZ0KHBhcnNlSW50KHYsIDEwKSk7XG4gICAgfSk7XG5cbiAgICBsZXQgdmFsdWVJbnQgPSAwO1xuICAgIGxldCBiYXNlID0gMTtcblxuICAgIGRpZ2l0cy5mb3JFYWNoKChkKSA9PiB7XG4gICAgICB2YWx1ZUludCArPSBkICogYmFzZTtcbiAgICAgIGJhc2UgKj0gNjA7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gc2lnbiAqIHZhbHVlSW50O1xuICB9XG5cbiAgcmV0dXJuIHNpZ24gKiBwYXJzZUludCh2YWx1ZSwgMTApO1xufVxuXG5mdW5jdGlvbiBpc0ludGVnZXIob2JqZWN0OiBBbnkpOiBib29sZWFuIHtcbiAgcmV0dXJuIChcbiAgICBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwob2JqZWN0KSA9PT0gXCJbb2JqZWN0IE51bWJlcl1cIiAmJlxuICAgIG9iamVjdCAlIDEgPT09IDAgJiZcbiAgICAhaXNOZWdhdGl2ZVplcm8ob2JqZWN0KVxuICApO1xufVxuXG5leHBvcnQgY29uc3QgaW50ID0gbmV3IFR5cGUoXCJ0YWc6eWFtbC5vcmcsMjAwMjppbnRcIiwge1xuICBjb25zdHJ1Y3Q6IGNvbnN0cnVjdFlhbWxJbnRlZ2VyLFxuICBkZWZhdWx0U3R5bGU6IFwiZGVjaW1hbFwiLFxuICBraW5kOiBcInNjYWxhclwiLFxuICBwcmVkaWNhdGU6IGlzSW50ZWdlcixcbiAgcmVwcmVzZW50OiB7XG4gICAgYmluYXJ5KG9iajogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBvYmogPj0gMFxuICAgICAgICA/IGAwYiR7b2JqLnRvU3RyaW5nKDIpfWBcbiAgICAgICAgOiBgLTBiJHtvYmoudG9TdHJpbmcoMikuc2xpY2UoMSl9YDtcbiAgICB9LFxuICAgIG9jdGFsKG9iajogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBvYmogPj0gMCA/IGAwJHtvYmoudG9TdHJpbmcoOCl9YCA6IGAtMCR7b2JqLnRvU3RyaW5nKDgpLnNsaWNlKDEpfWA7XG4gICAgfSxcbiAgICBkZWNpbWFsKG9iajogbnVtYmVyKTogc3RyaW5nIHtcbiAgICAgIHJldHVybiBvYmoudG9TdHJpbmcoMTApO1xuICAgIH0sXG4gICAgaGV4YWRlY2ltYWwob2JqOiBudW1iZXIpOiBzdHJpbmcge1xuICAgICAgcmV0dXJuIG9iaiA+PSAwXG4gICAgICAgID8gYDB4JHtvYmoudG9TdHJpbmcoMTYpLnRvVXBwZXJDYXNlKCl9YFxuICAgICAgICA6IGAtMHgke29iai50b1N0cmluZygxNikudG9VcHBlckNhc2UoKS5zbGljZSgxKX1gO1xuICAgIH0sXG4gIH0sXG4gIHJlc29sdmU6IHJlc29sdmVZYW1sSW50ZWdlcixcbiAgc3R5bGVBbGlhc2VzOiB7XG4gICAgYmluYXJ5OiBbMiwgXCJiaW5cIl0sXG4gICAgZGVjaW1hbDogWzEwLCBcImRlY1wiXSxcbiAgICBoZXhhZGVjaW1hbDogWzE2LCBcImhleFwiXSxcbiAgICBvY3RhbDogWzgsIFwib2N0XCJdLFxuICB9LFxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRTFFLFNBQVMsSUFBSSxRQUFRLGFBQWE7QUFDbEMsU0FBYyxjQUFjLFFBQVEsY0FBYztBQUVsRCxTQUFTLFVBQVUsQ0FBUyxFQUFXO0lBQ3JDLE9BQ0UsQUFBQyxRQUFRLEtBQUssR0FBRyxLQUFLLEtBQUssUUFDMUIsUUFBUSxLQUFLLEdBQUcsS0FBSyxLQUFLLFFBQzFCLFFBQVEsS0FBSyxHQUFHLEtBQUssS0FBSztBQUUvQjtBQUVBLFNBQVMsVUFBVSxDQUFTLEVBQVc7SUFDckMsT0FBTyxRQUFRLEtBQUssR0FBRyxLQUFLLEtBQUssS0FBSyxLQUFLO0FBQzdDO0FBRUEsU0FBUyxVQUFVLENBQVMsRUFBVztJQUNyQyxPQUFPLFFBQVEsS0FBSyxHQUFHLEtBQUssS0FBSyxLQUFLLEtBQUs7QUFDN0M7QUFFQSxTQUFTLG1CQUFtQixJQUFZLEVBQVc7SUFDakQsTUFBTSxNQUFNLEtBQUssTUFBTTtJQUN2QixJQUFJLFFBQVE7SUFDWixJQUFJLFlBQVksS0FBSztJQUVyQixJQUFJLENBQUMsS0FBSyxPQUFPLEtBQUs7SUFFdEIsSUFBSSxLQUFLLElBQUksQ0FBQyxNQUFNO0lBRXBCLE9BQU87SUFDUCxJQUFJLE9BQU8sT0FBTyxPQUFPLEtBQUs7UUFD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