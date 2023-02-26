// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { YAMLError } from "../error.ts";
import * as common from "../utils.ts";
import { DumperState } from "./dumper_state.ts";
const _toString = Object.prototype.toString;
const { hasOwn  } = Object;
const CHAR_TAB = 0x09; /* Tab */ 
const CHAR_LINE_FEED = 0x0a; /* LF */ 
const CHAR_SPACE = 0x20; /* Space */ 
const CHAR_EXCLAMATION = 0x21; /* ! */ 
const CHAR_DOUBLE_QUOTE = 0x22; /* " */ 
const CHAR_SHARP = 0x23; /* # */ 
const CHAR_PERCENT = 0x25; /* % */ 
const CHAR_AMPERSAND = 0x26; /* & */ 
const CHAR_SINGLE_QUOTE = 0x27; /* ' */ 
const CHAR_ASTERISK = 0x2a; /* * */ 
const CHAR_COMMA = 0x2c; /* , */ 
const CHAR_MINUS = 0x2d; /* - */ 
const CHAR_COLON = 0x3a; /* : */ 
const CHAR_GREATER_THAN = 0x3e; /* > */ 
const CHAR_QUESTION = 0x3f; /* ? */ 
const CHAR_COMMERCIAL_AT = 0x40; /* @ */ 
const CHAR_LEFT_SQUARE_BRACKET = 0x5b; /* [ */ 
const CHAR_RIGHT_SQUARE_BRACKET = 0x5d; /* ] */ 
const CHAR_GRAVE_ACCENT = 0x60; /* ` */ 
const CHAR_LEFT_CURLY_BRACKET = 0x7b; /* { */ 
const CHAR_VERTICAL_LINE = 0x7c; /* | */ 
const CHAR_RIGHT_CURLY_BRACKET = 0x7d; /* } */ 
const ESCAPE_SEQUENCES = {};
ESCAPE_SEQUENCES[0x00] = "\\0";
ESCAPE_SEQUENCES[0x07] = "\\a";
ESCAPE_SEQUENCES[0x08] = "\\b";
ESCAPE_SEQUENCES[0x09] = "\\t";
ESCAPE_SEQUENCES[0x0a] = "\\n";
ESCAPE_SEQUENCES[0x0b] = "\\v";
ESCAPE_SEQUENCES[0x0c] = "\\f";
ESCAPE_SEQUENCES[0x0d] = "\\r";
ESCAPE_SEQUENCES[0x1b] = "\\e";
ESCAPE_SEQUENCES[0x22] = '\\"';
ESCAPE_SEQUENCES[0x5c] = "\\\\";
ESCAPE_SEQUENCES[0x85] = "\\N";
ESCAPE_SEQUENCES[0xa0] = "\\_";
ESCAPE_SEQUENCES[0x2028] = "\\L";
ESCAPE_SEQUENCES[0x2029] = "\\P";
const DEPRECATED_BOOLEANS_SYNTAX = [
    "y",
    "Y",
    "yes",
    "Yes",
    "YES",
    "on",
    "On",
    "ON",
    "n",
    "N",
    "no",
    "No",
    "NO",
    "off",
    "Off",
    "OFF"
];
function encodeHex(character) {
    const string = character.toString(16).toUpperCase();
    let handle;
    let length;
    if (character <= 0xff) {
        handle = "x";
        length = 2;
    } else if (character <= 0xffff) {
        handle = "u";
        length = 4;
    } else if (character <= 0xffffffff) {
        handle = "U";
        length = 8;
    } else {
        throw new YAMLError("code point within a string may not be greater than 0xFFFFFFFF");
    }
    return `\\${handle}${common.repeat("0", length - string.length)}${string}`;
}
// Indents every line in a string. Empty lines (\n only) are not indented.
function indentString(string, spaces) {
    const ind = common.repeat(" ", spaces), length = string.length;
    let position = 0, next = -1, result = "", line;
    while(position < length){
        next = string.indexOf("\n", position);
        if (next === -1) {
            line = string.slice(position);
            position = length;
        } else {
            line = string.slice(position, next + 1);
            position = next + 1;
        }
        if (line.length && line !== "\n") result += ind;
        result += line;
    }
    return result;
}
function generateNextLine(state, level) {
    return `\n${common.repeat(" ", state.indent * level)}`;
}
function testImplicitResolving(state, str) {
    let type;
    for(let index = 0, length = state.implicitTypes.length; index < length; index += 1){
        type = state.implicitTypes[index];
        if (type.resolve(str)) {
            return true;
        }
    }
    return false;
}
// [33] s-white ::= s-space | s-tab
function isWhitespace(c) {
    return c === CHAR_SPACE || c === CHAR_TAB;
}
// Returns true if the character can be printed without escaping.
// From YAML 1.2: "any allowed characters known to be non-printable
// should also be escaped. [However,] This isn’t mandatory"
// Derived from nb-char - \t - #x85 - #xA0 - #x2028 - #x2029.
function isPrintable(c) {
    return 0x00020 <= c && c <= 0x00007e || 0x000a1 <= c && c <= 0x00d7ff && c !== 0x2028 && c !== 0x2029 || 0x0e000 <= c && c <= 0x00fffd && c !== 0xfeff || 0x10000 <= c && c <= 0x10ffff;
}
// Simplified test for values allowed after the first character in plain style.
function isPlainSafe(c) {
    // Uses a subset of nb-char - c-flow-indicator - ":" - "#"
    // where nb-char ::= c-printable - b-char - c-byte-order-mark.
    return isPrintable(c) && c !== 0xfeff && // - c-flow-indicator
    c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && // - ":" - "#"
    c !== CHAR_COLON && c !== CHAR_SHARP;
}
// Simplified test for values allowed as the first character in plain style.
function isPlainSafeFirst(c) {
    // Uses a subset of ns-char - c-indicator
    // where ns-char = nb-char - s-white.
    return isPrintable(c) && c !== 0xfeff && !isWhitespace(c) && // - s-white
    // - (c-indicator ::=
    // “-” | “?” | “:” | “,” | “[” | “]” | “{” | “}”
    c !== CHAR_MINUS && c !== CHAR_QUESTION && c !== CHAR_COLON && c !== CHAR_COMMA && c !== CHAR_LEFT_SQUARE_BRACKET && c !== CHAR_RIGHT_SQUARE_BRACKET && c !== CHAR_LEFT_CURLY_BRACKET && c !== CHAR_RIGHT_CURLY_BRACKET && // | “#” | “&” | “*” | “!” | “|” | “>” | “'” | “"”
    c !== CHAR_SHARP && c !== CHAR_AMPERSAND && c !== CHAR_ASTERISK && c !== CHAR_EXCLAMATION && c !== CHAR_VERTICAL_LINE && c !== CHAR_GREATER_THAN && c !== CHAR_SINGLE_QUOTE && c !== CHAR_DOUBLE_QUOTE && // | “%” | “@” | “`”)
    c !== CHAR_PERCENT && c !== CHAR_COMMERCIAL_AT && c !== CHAR_GRAVE_ACCENT;
}
// Determines whether block indentation indicator is required.
function needIndentIndicator(string) {
    const leadingSpaceRe = /^\n* /;
    return leadingSpaceRe.test(string);
}
const STYLE_PLAIN = 1, STYLE_SINGLE = 2, STYLE_LITERAL = 3, STYLE_FOLDED = 4, STYLE_DOUBLE = 5;
// Determines which scalar styles are possible and returns the preferred style.
// lineWidth = -1 => no limit.
// Pre-conditions: str.length > 0.
// Post-conditions:
//  STYLE_PLAIN or STYLE_SINGLE => no \n are in the string.
//  STYLE_LITERAL => no lines are suitable for folding (or lineWidth is -1).
//  STYLE_FOLDED => a line > lineWidth and can be folded (and lineWidth != -1).
function chooseScalarStyle(string, singleLineOnly, indentPerLevel, lineWidth, testAmbiguousType) {
    const shouldTrackWidth = lineWidth !== -1;
    let hasLineBreak = false, hasFoldableLine = false, previousLineBreak = -1, plain = isPlainSafeFirst(string.charCodeAt(0)) && !isWhitespace(string.charCodeAt(string.length - 1));
    let char, i;
    if (singleLineOnly) {
        // Case: no block styles.
        // Check for disallowed characters to rule out plain and single.
        for(i = 0; i < string.length; i++){
            char = string.charCodeAt(i);
            if (!isPrintable(char)) {
                return STYLE_DOUBLE;
            }
            plain = plain && isPlainSafe(char);
        }
    } else {
        // Case: block styles permitted.
        for(i = 0; i < string.length; i++){
            char = string.charCodeAt(i);
            if (char === CHAR_LINE_FEED) {
                hasLineBreak = true;
                // Check if any line can be folded.
                if (shouldTrackWidth) {
                    hasFoldableLine = hasFoldableLine || // Foldable line = too long, and not more-indented.
                    i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
                    previousLineBreak = i;
                }
            } else if (!isPrintable(char)) {
                return STYLE_DOUBLE;
            }
            plain = plain && isPlainSafe(char);
        }
        // in case the end is missing a \n
        hasFoldableLine = hasFoldableLine || shouldTrackWidth && i - previousLineBreak - 1 > lineWidth && string[previousLineBreak + 1] !== " ";
    }
    // Although every style can represent \n without escaping, prefer block styles
    // for multiline, since they're more readable and they don't add empty lines.
    // Also prefer folding a super-long line.
    if (!hasLineBreak && !hasFoldableLine) {
        // Strings interpretable as another type have to be quoted;
        // e.g. the string 'true' vs. the boolean true.
        return plain && !testAmbiguousType(string) ? STYLE_PLAIN : STYLE_SINGLE;
    }
    // Edge case: block indentation indicator can only have one digit.
    if (indentPerLevel > 9 && needIndentIndicator(string)) {
        return STYLE_DOUBLE;
    }
    // At this point we know block styles are valid.
    // Prefer literal style unless we want to fold.
    return hasFoldableLine ? STYLE_FOLDED : STYLE_LITERAL;
}
// Greedy line breaking.
// Picks the longest line under the limit each time,
// otherwise settles for the shortest line over the limit.
// NB. More-indented lines *cannot* be folded, as that would add an extra \n.
function foldLine(line, width) {
    if (line === "" || line[0] === " ") return line;
    // Since a more-indented line adds a \n, breaks can't be followed by a space.
    const breakRe = / [^ ]/g; // note: the match index will always be <= length-2.
    let match;
    // start is an inclusive index. end, curr, and next are exclusive.
    let start = 0, end, curr = 0, next = 0;
    let result = "";
    // Invariants: 0 <= start <= length-1.
    //   0 <= curr <= next <= max(0, length-2). curr - start <= width.
    // Inside the loop:
    //   A match implies length >= 2, so curr and next are <= length-2.
    // tslint:disable-next-line:no-conditional-assignment
    while(match = breakRe.exec(line)){
        next = match.index;
        // maintain invariant: curr - start <= width
        if (next - start > width) {
            end = curr > start ? curr : next; // derive end <= length-2
            result += `\n${line.slice(start, end)}`;
            // skip the space that was output as \n
            start = end + 1; // derive start <= length-1
        }
        curr = next;
    }
    // By the invariants, start <= length-1, so there is something left over.
    // It is either the whole string or a part starting from non-whitespace.
    result += "\n";
    // Insert a break if the remainder is too long and there is a break available.
    if (line.length - start > width && curr > start) {
        result += `${line.slice(start, curr)}\n${line.slice(curr + 1)}`;
    } else {
        result += line.slice(start);
    }
    return result.slice(1); // drop extra \n joiner
}
// (See the note for writeScalar.)
function dropEndingNewline(string) {
    return string[string.length - 1] === "\n" ? string.slice(0, -1) : string;
}
// Note: a long line without a suitable break point will exceed the width limit.
// Pre-conditions: every char in str isPrintable, str.length > 0, width > 0.
function foldString(string, width) {
    // In folded style, $k$ consecutive newlines output as $k+1$ newlines—
    // unless they're before or after a more-indented line, or at the very
    // beginning or end, in which case $k$ maps to $k$.
    // Therefore, parse each chunk as newline(s) followed by a content line.
    const lineRe = /(\n+)([^\n]*)/g;
    // first line (possibly an empty line)
    let result = (()=>{
        let nextLF = string.indexOf("\n");
        nextLF = nextLF !== -1 ? nextLF : string.length;
        lineRe.lastIndex = nextLF;
        return foldLine(string.slice(0, nextLF), width);
    })();
    // If we haven't reached the first content line yet, don't add an extra \n.
    let prevMoreIndented = string[0] === "\n" || string[0] === " ";
    let moreIndented;
    // rest of the lines
    let match;
    // tslint:disable-next-line:no-conditional-assignment
    while(match = lineRe.exec(string)){
        const prefix = match[1], line = match[2];
        moreIndented = line[0] === " ";
        result += prefix + (!prevMoreIndented && !moreIndented && line !== "" ? "\n" : "") + foldLine(line, width);
        prevMoreIndented = moreIndented;
    }
    return result;
}
// Escapes a double-quoted string.
function escapeString(string) {
    let result = "";
    let char, nextChar;
    let escapeSeq;
    for(let i = 0; i < string.length; i++){
        char = string.charCodeAt(i);
        // Check for surrogate pairs (reference Unicode 3.0 section "3.7 Surrogates").
        if (char >= 0xd800 && char <= 0xdbff /* high surrogate */ ) {
            nextChar = string.charCodeAt(i + 1);
            if (nextChar >= 0xdc00 && nextChar <= 0xdfff /* low surrogate */ ) {
                // Combine the surrogate pair and store it escaped.
                result += encodeHex((char - 0xd800) * 0x400 + nextChar - 0xdc00 + 0x10000);
                // Advance index one extra since we already used that char here.
                i++;
                continue;
            }
        }
        escapeSeq = ESCAPE_SEQUENCES[char];
        result += !escapeSeq && isPrintable(char) ? string[i] : escapeSeq || encodeHex(char);
    }
    return result;
}
// Pre-conditions: string is valid for a block scalar, 1 <= indentPerLevel <= 9.
function blockHeader(string, indentPerLevel) {
    const indentIndicator = needIndentIndicator(string) ? String(indentPerLevel) : "";
    // note the special case: the string '\n' counts as a "trailing" empty line.
    const clip = string[string.length - 1] === "\n";
    const keep = clip && (string[string.length - 2] === "\n" || string === "\n");
    const chomp = keep ? "+" : clip ? "" : "-";
    return `${indentIndicator}${chomp}\n`;
}
// Note: line breaking/folding is implemented for only the folded style.
// NB. We drop the last trailing newline (if any) of a returned block scalar
//  since the dumper adds its own newline. This always works:
//    • No ending newline => unaffected; already using strip "-" chomping.
//    • Ending newline    => removed then restored.
//  Importantly, this keeps the "+" chomp indicator from gaining an extra line.
function writeScalar(state, string, level, iskey) {
    state.dump = (()=>{
        if (string.length === 0) {
            return "''";
        }
        if (!state.noCompatMode && DEPRECATED_BOOLEANS_SYNTAX.indexOf(string) !== -1) {
            return `'${string}'`;
        }
        const indent = state.indent * Math.max(1, level); // no 0-indent scalars
        // As indentation gets deeper, let the width decrease monotonically
        // to the lower bound min(state.lineWidth, 40).
        // Note that this implies
        //  state.lineWidth ≤ 40 + state.indent: width is fixed at the lower bound.
        //  state.lineWidth > 40 + state.indent: width decreases until the lower
        //  bound.
        // This behaves better than a constant minimum width which disallows
        // narrower options, or an indent threshold which causes the width
        // to suddenly increase.
        const lineWidth = state.lineWidth === -1 ? -1 : Math.max(Math.min(state.lineWidth, 40), state.lineWidth - indent);
        // Without knowing if keys are implicit/explicit,
        // assume implicit for safety.
        const singleLineOnly = iskey || // No block styles in flow mode.
        state.flowLevel > -1 && level >= state.flowLevel;
        function testAmbiguity(str) {
            return testImplicitResolving(state, str);
        }
        switch(chooseScalarStyle(string, singleLineOnly, state.indent, lineWidth, testAmbiguity)){
            case STYLE_PLAIN:
                return string;
            case STYLE_SINGLE:
                return `'${string.replace(/'/g, "''")}'`;
            case STYLE_LITERAL:
                return `|${blockHeader(string, state.indent)}${dropEndingNewline(indentString(string, indent))}`;
            case STYLE_FOLDED:
                return `>${blockHeader(string, state.indent)}${dropEndingNewline(indentString(foldString(string, lineWidth), indent))}`;
            case STYLE_DOUBLE:
                return `"${escapeString(string)}"`;
            default:
                throw new YAMLError("impossible error: invalid scalar style");
        }
    })();
}
function writeFlowSequence(state, level, object) {
    let _result = "";
    const _tag = state.tag;
    for(let index = 0, length = object.length; index < length; index += 1){
        // Write only valid elements.
        if (writeNode(state, level, object[index], false, false)) {
            if (index !== 0) _result += `,${!state.condenseFlow ? " " : ""}`;
            _result += state.dump;
        }
    }
    state.tag = _tag;
    state.dump = `[${_result}]`;
}
function writeBlockSequence(state, level, object, compact = false) {
    let _result = "";
    const _tag = state.tag;
    for(let index = 0, length = object.length; index < length; index += 1){
        // Write only valid elements.
        if (writeNode(state, level + 1, object[index], true, true)) {
            if (!compact || index !== 0) {
                _result += generateNextLine(state, level);
            }
            if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
                _result += "-";
            } else {
                _result += "- ";
            }
            _result += state.dump;
        }
    }
    state.tag = _tag;
    state.dump = _result || "[]"; // Empty sequence if no valid values.
}
function writeFlowMapping(state, level, object) {
    let _result = "";
    const _tag = state.tag, objectKeyList = Object.keys(object);
    let pairBuffer, objectKey, objectValue;
    for(let index = 0, length = objectKeyList.length; index < length; index += 1){
        pairBuffer = state.condenseFlow ? '"' : "";
        if (index !== 0) pairBuffer += ", ";
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (!writeNode(state, level, objectKey, false, false)) {
            continue; // Skip this pair because of invalid key;
        }
        if (state.dump.length > 1024) pairBuffer += "? ";
        pairBuffer += `${state.dump}${state.condenseFlow ? '"' : ""}:${state.condenseFlow ? "" : " "}`;
        if (!writeNode(state, level, objectValue, false, false)) {
            continue; // Skip this pair because of invalid value.
        }
        pairBuffer += state.dump;
        // Both key and value are valid.
        _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = `{${_result}}`;
}
function writeBlockMapping(state, level, object, compact = false) {
    const _tag = state.tag, objectKeyList = Object.keys(object);
    let _result = "";
    // Allow sorting keys so that the output file is deterministic
    if (state.sortKeys === true) {
        // Default sorting
        objectKeyList.sort();
    } else if (typeof state.sortKeys === "function") {
        // Custom sort function
        objectKeyList.sort(state.sortKeys);
    } else if (state.sortKeys) {
        // Something is wrong
        throw new YAMLError("sortKeys must be a boolean or a function");
    }
    let pairBuffer = "", objectKey, objectValue, explicitPair;
    for(let index = 0, length = objectKeyList.length; index < length; index += 1){
        pairBuffer = "";
        if (!compact || index !== 0) {
            pairBuffer += generateNextLine(state, level);
        }
        objectKey = objectKeyList[index];
        objectValue = object[objectKey];
        if (!writeNode(state, level + 1, objectKey, true, true, true)) {
            continue; // Skip this pair because of invalid key.
        }
        explicitPair = state.tag !== null && state.tag !== "?" || state.dump && state.dump.length > 1024;
        if (explicitPair) {
            if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
                pairBuffer += "?";
            } else {
                pairBuffer += "? ";
            }
        }
        pairBuffer += state.dump;
        if (explicitPair) {
            pairBuffer += generateNextLine(state, level);
        }
        if (!writeNode(state, level + 1, objectValue, true, explicitPair)) {
            continue; // Skip this pair because of invalid value.
        }
        if (state.dump && CHAR_LINE_FEED === state.dump.charCodeAt(0)) {
            pairBuffer += ":";
        } else {
            pairBuffer += ": ";
        }
        pairBuffer += state.dump;
        // Both key and value are valid.
        _result += pairBuffer;
    }
    state.tag = _tag;
    state.dump = _result || "{}"; // Empty mapping if no valid pairs.
}
function detectType(state, object, explicit = false) {
    const typeList = explicit ? state.explicitTypes : state.implicitTypes;
    let type;
    let style;
    let _result;
    for(let index = 0, length = typeList.length; index < length; index += 1){
        type = typeList[index];
        if ((type.instanceOf || type.predicate) && (!type.instanceOf || typeof object === "object" && object instanceof type.instanceOf) && (!type.predicate || type.predicate(object))) {
            state.tag = explicit ? type.tag : "?";
            if (type.represent) {
                style = state.styleMap[type.tag] || type.defaultStyle;
                if (_toString.call(type.represent) === "[object Function]") {
                    _result = type.represent(object, style);
                } else if (hasOwn(type.represent, style)) {
                    _result = type.represent[style](object, style);
                } else {
                    throw new YAMLError(`!<${type.tag}> tag resolver accepts not "${style}" style`);
                }
                state.dump = _result;
            }
            return true;
        }
    }
    return false;
}
// Serializes `object` and writes it to global `result`.
// Returns true on success, or false on invalid object.
//
function writeNode(state, level, object, block, compact, iskey = false) {
    state.tag = null;
    state.dump = object;
    if (!detectType(state, object, false)) {
        detectType(state, object, true);
    }
    const type = _toString.call(state.dump);
    if (block) {
        block = state.flowLevel < 0 || state.flowLevel > level;
    }
    const objectOrArray = type === "[object Object]" || type === "[object Array]";
    let duplicateIndex = -1;
    let duplicate = false;
    if (objectOrArray) {
        duplicateIndex = state.duplicates.indexOf(object);
        duplicate = duplicateIndex !== -1;
    }
    if (state.tag !== null && state.tag !== "?" || duplicate || state.indent !== 2 && level > 0) {
        compact = false;
    }
    if (duplicate && state.usedDuplicates[duplicateIndex]) {
        state.dump = `*ref_${duplicateIndex}`;
    } else {
        if (objectOrArray && duplicate && !state.usedDuplicates[duplicateIndex]) {
            state.usedDuplicates[duplicateIndex] = true;
        }
        if (type === "[object Object]") {
            if (block && Object.keys(state.dump).length !== 0) {
                writeBlockMapping(state, level, state.dump, compact);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex}${state.dump}`;
                }
            } else {
                writeFlowMapping(state, level, state.dump);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                }
            }
        } else if (type === "[object Array]") {
            const arrayLevel = state.noArrayIndent && level > 0 ? level - 1 : level;
            if (block && state.dump.length !== 0) {
                writeBlockSequence(state, arrayLevel, state.dump, compact);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex}${state.dump}`;
                }
            } else {
                writeFlowSequence(state, arrayLevel, state.dump);
                if (duplicate) {
                    state.dump = `&ref_${duplicateIndex} ${state.dump}`;
                }
            }
        } else if (type === "[object String]") {
            if (state.tag !== "?") {
                writeScalar(state, state.dump, level, iskey);
            }
        } else {
            if (state.skipInvalid) return false;
            throw new YAMLError(`unacceptable kind of an object to dump ${type}`);
        }
        if (state.tag !== null && state.tag !== "?") {
            state.dump = `!<${state.tag}> ${state.dump}`;
        }
    }
    return true;
}
function inspectNode(object, objects, duplicatesIndexes) {
    if (object !== null && typeof object === "object") {
        const index = objects.indexOf(object);
        if (index !== -1) {
            if (duplicatesIndexes.indexOf(index) === -1) {
                duplicatesIndexes.push(index);
            }
        } else {
            objects.push(object);
            if (Array.isArray(object)) {
                for(let idx = 0, length = object.length; idx < length; idx += 1){
                    inspectNode(object[idx], objects, duplicatesIndexes);
                }
            } else {
                const objectKeyList = Object.keys(object);
                for(let idx = 0, length = objectKeyList.length; idx < length; idx += 1){
                    inspectNode(object[objectKeyList[idx]], objects, duplicatesIndexes);
                }
            }
        }
    }
}
function getDuplicateReferences(object, state) {
    const objects = [], duplicatesIndexes = [];
    inspectNode(object, objects, duplicatesIndexes);
    const length = duplicatesIndexes.length;
    for(let index = 0; index < length; index += 1){
        state.duplicates.push(objects[duplicatesIndexes[index]]);
    }
    state.usedDuplicates = Array.from({
        length
    });
}
export function dump(input, options) {
    options = options || {};
    const state = new DumperState(options);
    if (!state.noRefs) getDuplicateReferences(input, state);
    if (writeNode(state, 0, input, true, true)) return `${state.dump}\n`;
    return "";
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL2R1bXBlci9kdW1wZXIudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGZyb20ganMteWFtbCB2My4xMy4xOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9qcy15YW1sL2NvbW1pdC82NjVhYWRkYTQyMzQ5ZGNhZTg2OWYxMjA0MGQ5YjEwZWYxOGQxMmRhXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgWUFNTEVycm9yIH0gZnJvbSBcIi4uL2Vycm9yLnRzXCI7XG5pbXBvcnQgdHlwZSB7IFJlcHJlc2VudEZuLCBTdHlsZVZhcmlhbnQsIFR5cGUgfSBmcm9tIFwiLi4vdHlwZS50c1wiO1xuaW1wb3J0ICogYXMgY29tbW9uIGZyb20gXCIuLi91dGlscy50c1wiO1xuaW1wb3J0IHsgRHVtcGVyU3RhdGUsIER1bXBlclN0YXRlT3B0aW9ucyB9IGZyb20gXCIuL2R1bXBlcl9zdGF0ZS50c1wiO1xuXG50eXBlIEFueSA9IGNvbW1vbi5Bbnk7XG50eXBlIEFycmF5T2JqZWN0PFQgPSBBbnk+ID0gY29tbW9uLkFycmF5T2JqZWN0PFQ+O1xuXG5jb25zdCBfdG9TdHJpbmcgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuY29uc3QgeyBoYXNPd24gfSA9IE9iamVjdDtcblxuY29uc3QgQ0hBUl9UQUIgPSAweDA5OyAvKiBUYWIgKi9cbmNvbnN0IENIQVJfTElORV9GRUVEID0gMHgwYTsgLyogTEYgKi9cbmNvbnN0IENIQVJfU1BBQ0UgPSAweDIwOyAvKiBTcGFjZSAqL1xuY29uc3QgQ0hBUl9FWENMQU1BVElPTiA9IDB4MjE7IC8qICEgKi9cbmNvbnN0IENIQVJfRE9VQkxFX1FVT1RFID0gMHgyMjsgLyogXCIgKi9cbmNvbnN0IENIQVJfU0hBUlAgPSAweDIzOyAvKiAjICovXG5jb25zdCBDSEFSX1BFUkNFTlQgPSAweDI1OyAvKiAlICovXG5jb25zdCBDSEFSX0FNUEVSU0FORCA9IDB4MjY7IC8qICYgKi9cbmNvbnN0IENIQVJfU0lOR0xFX1FVT1RFID0gMHgyNzsgLyogJyAqL1xuY29uc3QgQ0hBUl9BU1RFUklTSyA9IDB4MmE7IC8qICogKi9cbmNvbnN0IENIQVJfQ09NTUEgPSAweDJjOyAvKiAsICovXG5jb25zdCBDSEFSX01JTlVTID0gMHgyZDsgLyogLSAqL1xuY29uc3QgQ0hBUl9DT0xPTiA9IDB4M2E7IC8qIDogKi9cbmNvbnN0IENIQVJfR1JFQVRFUl9USEFOID0gMHgzZTsgLyogPiAqL1xuY29uc3QgQ0hBUl9RVUVTVElPTiA9IDB4M2Y7IC8qID8gKi9cbmNvbnN0IENIQVJfQ09NTUVSQ0lBTF9BVCA9IDB4NDA7IC8qIEAgKi9cbmNvbnN0IENIQVJfTEVGVF9TUVVBUkVfQlJBQ0tFVCA9IDB4NWI7IC8qIFsgKi9cbmNvbnN0IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgPSAweDVkOyAvKiBdICovXG5jb25zdCBDSEFSX0dSQVZFX0FDQ0VOVCA9IDB4NjA7IC8qIGAgKi9cbmNvbnN0IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUID0gMHg3YjsgLyogeyAqL1xuY29uc3QgQ0hBUl9WRVJUSUNBTF9MSU5FID0gMHg3YzsgLyogfCAqL1xuY29uc3QgQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUID0gMHg3ZDsgLyogfSAqL1xuXG5jb25zdCBFU0NBUEVfU0VRVUVOQ0VTOiB7IFtjaGFyOiBudW1iZXJdOiBzdHJpbmcgfSA9IHt9O1xuXG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDBdID0gXCJcXFxcMFwiO1xuRVNDQVBFX1NFUVVFTkNFU1sweDA3XSA9IFwiXFxcXGFcIjtcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwOF0gPSBcIlxcXFxiXCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MDldID0gXCJcXFxcdFwiO1xuRVNDQVBFX1NFUVVFTkNFU1sweDBhXSA9IFwiXFxcXG5cIjtcbkVTQ0FQRV9TRVFVRU5DRVNbMHgwYl0gPSBcIlxcXFx2XCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MGNdID0gXCJcXFxcZlwiO1xuRVNDQVBFX1NFUVVFTkNFU1sweDBkXSA9IFwiXFxcXHJcIjtcbkVTQ0FQRV9TRVFVRU5DRVNbMHgxYl0gPSBcIlxcXFxlXCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MjJdID0gJ1xcXFxcIic7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4NWNdID0gXCJcXFxcXFxcXFwiO1xuRVNDQVBFX1NFUVVFTkNFU1sweDg1XSA9IFwiXFxcXE5cIjtcbkVTQ0FQRV9TRVFVRU5DRVNbMHhhMF0gPSBcIlxcXFxfXCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MjAyOF0gPSBcIlxcXFxMXCI7XG5FU0NBUEVfU0VRVUVOQ0VTWzB4MjAyOV0gPSBcIlxcXFxQXCI7XG5cbmNvbnN0IERFUFJFQ0FURURfQk9PTEVBTlNfU1lOVEFYID0gW1xuICBcInlcIixcbiAgXCJZXCIsXG4gIFwieWVzXCIsXG4gIFwiWWVzXCIsXG4gIFwiWUVTXCIsXG4gIFwib25cIixcbiAgXCJPblwiLFxuICBcIk9OXCIsXG4gIFwiblwiLFxuICBcIk5cIixcbiAgXCJub1wiLFxuICBcIk5vXCIsXG4gIFwiTk9cIixcbiAgXCJvZmZcIixcbiAgXCJPZmZcIixcbiAgXCJPRkZcIixcbl07XG5cbmZ1bmN0aW9uIGVuY29kZUhleChjaGFyYWN0ZXI6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IHN0cmluZyA9IGNoYXJhY3Rlci50b1N0cmluZygxNikudG9VcHBlckNhc2UoKTtcblxuICBsZXQgaGFuZGxlOiBzdHJpbmc7XG4gIGxldCBsZW5ndGg6IG51bWJlcjtcbiAgaWYgKGNoYXJhY3RlciA8PSAweGZmKSB7XG4gICAgaGFuZGxlID0gXCJ4XCI7XG4gICAgbGVuZ3RoID0gMjtcbiAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPD0gMHhmZmZmKSB7XG4gICAgaGFuZGxlID0gXCJ1XCI7XG4gICAgbGVuZ3RoID0gNDtcbiAgfSBlbHNlIGlmIChjaGFyYWN0ZXIgPD0gMHhmZmZmZmZmZikge1xuICAgIGhhbmRsZSA9IFwiVVwiO1xuICAgIGxlbmd0aCA9IDg7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IFlBTUxFcnJvcihcbiAgICAgIFwiY29kZSBwb2ludCB3aXRoaW4gYSBzdHJpbmcgbWF5IG5vdCBiZSBncmVhdGVyIHRoYW4gMHhGRkZGRkZGRlwiLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gYFxcXFwke2hhbmRsZX0ke2NvbW1vbi5yZXBlYXQoXCIwXCIsIGxlbmd0aCAtIHN0cmluZy5sZW5ndGgpfSR7c3RyaW5nfWA7XG59XG5cbi8vIEluZGVudHMgZXZlcnkgbGluZSBpbiBhIHN0cmluZy4gRW1wdHkgbGluZXMgKFxcbiBvbmx5KSBhcmUgbm90IGluZGVudGVkLlxuZnVuY3Rpb24gaW5kZW50U3RyaW5nKHN0cmluZzogc3RyaW5nLCBzcGFjZXM6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IGluZCA9IGNvbW1vbi5yZXBlYXQoXCIgXCIsIHNwYWNlcyksXG4gICAgbGVuZ3RoID0gc3RyaW5nLmxlbmd0aDtcbiAgbGV0IHBvc2l0aW9uID0gMCxcbiAgICBuZXh0ID0gLTEsXG4gICAgcmVzdWx0ID0gXCJcIixcbiAgICBsaW5lOiBzdHJpbmc7XG5cbiAgd2hpbGUgKHBvc2l0aW9uIDwgbGVuZ3RoKSB7XG4gICAgbmV4dCA9IHN0cmluZy5pbmRleE9mKFwiXFxuXCIsIHBvc2l0aW9uKTtcbiAgICBpZiAobmV4dCA9PT0gLTEpIHtcbiAgICAgIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zaXRpb24pO1xuICAgICAgcG9zaXRpb24gPSBsZW5ndGg7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxpbmUgPSBzdHJpbmcuc2xpY2UocG9zaXRpb24sIG5leHQgKyAxKTtcbiAgICAgIHBvc2l0aW9uID0gbmV4dCArIDE7XG4gICAgfVxuXG4gICAgaWYgKGxpbmUubGVuZ3RoICYmIGxpbmUgIT09IFwiXFxuXCIpIHJlc3VsdCArPSBpbmQ7XG5cbiAgICByZXN1bHQgKz0gbGluZTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbmZ1bmN0aW9uIGdlbmVyYXRlTmV4dExpbmUoc3RhdGU6IER1bXBlclN0YXRlLCBsZXZlbDogbnVtYmVyKTogc3RyaW5nIHtcbiAgcmV0dXJuIGBcXG4ke2NvbW1vbi5yZXBlYXQoXCIgXCIsIHN0YXRlLmluZGVudCAqIGxldmVsKX1gO1xufVxuXG5mdW5jdGlvbiB0ZXN0SW1wbGljaXRSZXNvbHZpbmcoc3RhdGU6IER1bXBlclN0YXRlLCBzdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBsZXQgdHlwZTogVHlwZTtcbiAgZm9yIChcbiAgICBsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBzdGF0ZS5pbXBsaWNpdFR5cGVzLmxlbmd0aDtcbiAgICBpbmRleCA8IGxlbmd0aDtcbiAgICBpbmRleCArPSAxXG4gICkge1xuICAgIHR5cGUgPSBzdGF0ZS5pbXBsaWNpdFR5cGVzW2luZGV4XTtcblxuICAgIGlmICh0eXBlLnJlc29sdmUoc3RyKSkge1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGZhbHNlO1xufVxuXG4vLyBbMzNdIHMtd2hpdGUgOjo9IHMtc3BhY2UgfCBzLXRhYlxuZnVuY3Rpb24gaXNXaGl0ZXNwYWNlKGM6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gYyA9PT0gQ0hBUl9TUEFDRSB8fCBjID09PSBDSEFSX1RBQjtcbn1cblxuLy8gUmV0dXJucyB0cnVlIGlmIHRoZSBjaGFyYWN0ZXIgY2FuIGJlIHByaW50ZWQgd2l0aG91dCBlc2NhcGluZy5cbi8vIEZyb20gWUFNTCAxLjI6IFwiYW55IGFsbG93ZWQgY2hhcmFjdGVycyBrbm93biB0byBiZSBub24tcHJpbnRhYmxlXG4vLyBzaG91bGQgYWxzbyBiZSBlc2NhcGVkLiBbSG93ZXZlcixdIFRoaXMgaXNu4oCZdCBtYW5kYXRvcnlcIlxuLy8gRGVyaXZlZCBmcm9tIG5iLWNoYXIgLSBcXHQgLSAjeDg1IC0gI3hBMCAtICN4MjAyOCAtICN4MjAyOS5cbmZ1bmN0aW9uIGlzUHJpbnRhYmxlKGM6IG51bWJlcik6IGJvb2xlYW4ge1xuICByZXR1cm4gKFxuICAgICgweDAwMDIwIDw9IGMgJiYgYyA8PSAweDAwMDA3ZSkgfHxcbiAgICAoMHgwMDBhMSA8PSBjICYmIGMgPD0gMHgwMGQ3ZmYgJiYgYyAhPT0gMHgyMDI4ICYmIGMgIT09IDB4MjAyOSkgfHxcbiAgICAoMHgwZTAwMCA8PSBjICYmIGMgPD0gMHgwMGZmZmQgJiYgYyAhPT0gMHhmZWZmKSAvKiBCT00gKi8gfHxcbiAgICAoMHgxMDAwMCA8PSBjICYmIGMgPD0gMHgxMGZmZmYpXG4gICk7XG59XG5cbi8vIFNpbXBsaWZpZWQgdGVzdCBmb3IgdmFsdWVzIGFsbG93ZWQgYWZ0ZXIgdGhlIGZpcnN0IGNoYXJhY3RlciBpbiBwbGFpbiBzdHlsZS5cbmZ1bmN0aW9uIGlzUGxhaW5TYWZlKGM6IG51bWJlcik6IGJvb2xlYW4ge1xuICAvLyBVc2VzIGEgc3Vic2V0IG9mIG5iLWNoYXIgLSBjLWZsb3ctaW5kaWNhdG9yIC0gXCI6XCIgLSBcIiNcIlxuICAvLyB3aGVyZSBuYi1jaGFyIDo6PSBjLXByaW50YWJsZSAtIGItY2hhciAtIGMtYnl0ZS1vcmRlci1tYXJrLlxuICByZXR1cm4gKFxuICAgIGlzUHJpbnRhYmxlKGMpICYmXG4gICAgYyAhPT0gMHhmZWZmICYmXG4gICAgLy8gLSBjLWZsb3ctaW5kaWNhdG9yXG4gICAgYyAhPT0gQ0hBUl9DT01NQSAmJlxuICAgIGMgIT09IENIQVJfTEVGVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgIGMgIT09IENIQVJfUklHSFRfU1FVQVJFX0JSQUNLRVQgJiZcbiAgICBjICE9PSBDSEFSX0xFRlRfQ1VSTFlfQlJBQ0tFVCAmJlxuICAgIGMgIT09IENIQVJfUklHSFRfQ1VSTFlfQlJBQ0tFVCAmJlxuICAgIC8vIC0gXCI6XCIgLSBcIiNcIlxuICAgIGMgIT09IENIQVJfQ09MT04gJiZcbiAgICBjICE9PSBDSEFSX1NIQVJQXG4gICk7XG59XG5cbi8vIFNpbXBsaWZpZWQgdGVzdCBmb3IgdmFsdWVzIGFsbG93ZWQgYXMgdGhlIGZpcnN0IGNoYXJhY3RlciBpbiBwbGFpbiBzdHlsZS5cbmZ1bmN0aW9uIGlzUGxhaW5TYWZlRmlyc3QoYzogbnVtYmVyKTogYm9vbGVhbiB7XG4gIC8vIFVzZXMgYSBzdWJzZXQgb2YgbnMtY2hhciAtIGMtaW5kaWNhdG9yXG4gIC8vIHdoZXJlIG5zLWNoYXIgPSBuYi1jaGFyIC0gcy13aGl0ZS5cbiAgcmV0dXJuIChcbiAgICBpc1ByaW50YWJsZShjKSAmJlxuICAgIGMgIT09IDB4ZmVmZiAmJlxuICAgICFpc1doaXRlc3BhY2UoYykgJiYgLy8gLSBzLXdoaXRlXG4gICAgLy8gLSAoYy1pbmRpY2F0b3IgOjo9XG4gICAgLy8g4oCcLeKAnSB8IOKAnD/igJ0gfCDigJw64oCdIHwg4oCcLOKAnSB8IOKAnFvigJ0gfCDigJxd4oCdIHwg4oCce+KAnSB8IOKAnH3igJ1cbiAgICBjICE9PSBDSEFSX01JTlVTICYmXG4gICAgYyAhPT0gQ0hBUl9RVUVTVElPTiAmJlxuICAgIGMgIT09IENIQVJfQ09MT04gJiZcbiAgICBjICE9PSBDSEFSX0NPTU1BICYmXG4gICAgYyAhPT0gQ0hBUl9MRUZUX1NRVUFSRV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9TUVVBUkVfQlJBQ0tFVCAmJlxuICAgIGMgIT09IENIQVJfTEVGVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgYyAhPT0gQ0hBUl9SSUdIVF9DVVJMWV9CUkFDS0VUICYmXG4gICAgLy8gfCDigJwj4oCdIHwg4oCcJuKAnSB8IOKAnCrigJ0gfCDigJwh4oCdIHwg4oCcfOKAnSB8IOKAnD7igJ0gfCDigJwn4oCdIHwg4oCcXCLigJ1cbiAgICBjICE9PSBDSEFSX1NIQVJQICYmXG4gICAgYyAhPT0gQ0hBUl9BTVBFUlNBTkQgJiZcbiAgICBjICE9PSBDSEFSX0FTVEVSSVNLICYmXG4gICAgYyAhPT0gQ0hBUl9FWENMQU1BVElPTiAmJlxuICAgIGMgIT09IENIQVJfVkVSVElDQUxfTElORSAmJlxuICAgIGMgIT09IENIQVJfR1JFQVRFUl9USEFOICYmXG4gICAgYyAhPT0gQ0hBUl9TSU5HTEVfUVVPVEUgJiZcbiAgICBjICE9PSBDSEFSX0RPVUJMRV9RVU9URSAmJlxuICAgIC8vIHwg4oCcJeKAnSB8IOKAnEDigJ0gfCDigJxg4oCdKVxuICAgIGMgIT09IENIQVJfUEVSQ0VOVCAmJlxuICAgIGMgIT09IENIQVJfQ09NTUVSQ0lBTF9BVCAmJlxuICAgIGMgIT09IENIQVJfR1JBVkVfQUNDRU5UXG4gICk7XG59XG5cbi8vIERldGVybWluZXMgd2hldGhlciBibG9jayBpbmRlbnRhdGlvbiBpbmRpY2F0b3IgaXMgcmVxdWlyZWQuXG5mdW5jdGlvbiBuZWVkSW5kZW50SW5kaWNhdG9yKHN0cmluZzogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGxlYWRpbmdTcGFjZVJlID0gL15cXG4qIC87XG4gIHJldHVybiBsZWFkaW5nU3BhY2VSZS50ZXN0KHN0cmluZyk7XG59XG5cbmNvbnN0IFNUWUxFX1BMQUlOID0gMSxcbiAgU1RZTEVfU0lOR0xFID0gMixcbiAgU1RZTEVfTElURVJBTCA9IDMsXG4gIFNUWUxFX0ZPTERFRCA9IDQsXG4gIFNUWUxFX0RPVUJMRSA9IDU7XG5cbi8vIERldGVybWluZXMgd2hpY2ggc2NhbGFyIHN0eWxlcyBhcmUgcG9zc2libGUgYW5kIHJldHVybnMgdGhlIHByZWZlcnJlZCBzdHlsZS5cbi8vIGxpbmVXaWR0aCA9IC0xID0+IG5vIGxpbWl0LlxuLy8gUHJlLWNvbmRpdGlvbnM6IHN0ci5sZW5ndGggPiAwLlxuLy8gUG9zdC1jb25kaXRpb25zOlxuLy8gIFNUWUxFX1BMQUlOIG9yIFNUWUxFX1NJTkdMRSA9PiBubyBcXG4gYXJlIGluIHRoZSBzdHJpbmcuXG4vLyAgU1RZTEVfTElURVJBTCA9PiBubyBsaW5lcyBhcmUgc3VpdGFibGUgZm9yIGZvbGRpbmcgKG9yIGxpbmVXaWR0aCBpcyAtMSkuXG4vLyAgU1RZTEVfRk9MREVEID0+IGEgbGluZSA+IGxpbmVXaWR0aCBhbmQgY2FuIGJlIGZvbGRlZCAoYW5kIGxpbmVXaWR0aCAhPSAtMSkuXG5mdW5jdGlvbiBjaG9vc2VTY2FsYXJTdHlsZShcbiAgc3RyaW5nOiBzdHJpbmcsXG4gIHNpbmdsZUxpbmVPbmx5OiBib29sZWFuLFxuICBpbmRlbnRQZXJMZXZlbDogbnVtYmVyLFxuICBsaW5lV2lkdGg6IG51bWJlcixcbiAgdGVzdEFtYmlndW91c1R5cGU6ICguLi5hcmdzOiBBbnlbXSkgPT4gQW55LFxuKTogbnVtYmVyIHtcbiAgY29uc3Qgc2hvdWxkVHJhY2tXaWR0aCA9IGxpbmVXaWR0aCAhPT0gLTE7XG4gIGxldCBoYXNMaW5lQnJlYWsgPSBmYWxzZSxcbiAgICBoYXNGb2xkYWJsZUxpbmUgPSBmYWxzZSwgLy8gb25seSBjaGVja2VkIGlmIHNob3VsZFRyYWNrV2lkdGhcbiAgICBwcmV2aW91c0xpbmVCcmVhayA9IC0xLCAvLyBjb3VudCB0aGUgZmlyc3QgbGluZSBjb3JyZWN0bHlcbiAgICBwbGFpbiA9IGlzUGxhaW5TYWZlRmlyc3Qoc3RyaW5nLmNoYXJDb2RlQXQoMCkpICYmXG4gICAgICAhaXNXaGl0ZXNwYWNlKHN0cmluZy5jaGFyQ29kZUF0KHN0cmluZy5sZW5ndGggLSAxKSk7XG5cbiAgbGV0IGNoYXI6IG51bWJlciwgaTogbnVtYmVyO1xuICBpZiAoc2luZ2xlTGluZU9ubHkpIHtcbiAgICAvLyBDYXNlOiBubyBibG9jayBzdHlsZXMuXG4gICAgLy8gQ2hlY2sgZm9yIGRpc2FsbG93ZWQgY2hhcmFjdGVycyB0byBydWxlIG91dCBwbGFpbiBhbmQgc2luZ2xlLlxuICAgIGZvciAoaSA9IDA7IGkgPCBzdHJpbmcubGVuZ3RoOyBpKyspIHtcbiAgICAgIGNoYXIgPSBzdHJpbmcuY2hhckNvZGVBdChpKTtcbiAgICAgIGlmICghaXNQcmludGFibGUoY2hhcikpIHtcbiAgICAgICAgcmV0dXJuIFNUWUxFX0RPVUJMRTtcbiAgICAgIH1cbiAgICAgIHBsYWluID0gcGxhaW4gJiYgaXNQbGFpblNhZmUoY2hhcik7XG4gICAgfVxuICB9IGVsc2Uge1xuICAgIC8vIENhc2U6IGJsb2NrIHN0eWxlcyBwZXJtaXR0ZWQuXG4gICAgZm9yIChpID0gMDsgaSA8IHN0cmluZy5sZW5ndGg7IGkrKykge1xuICAgICAgY2hhciA9IHN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICAgICAgaWYgKGNoYXIgPT09IENIQVJfTElORV9GRUVEKSB7XG4gICAgICAgIGhhc0xpbmVCcmVhayA9IHRydWU7XG4gICAgICAgIC8vIENoZWNrIGlmIGFueSBsaW5lIGNhbiBiZSBmb2xkZWQuXG4gICAgICAgIGlmIChzaG91bGRUcmFja1dpZHRoKSB7XG4gICAgICAgICAgaGFzRm9sZGFibGVMaW5lID0gaGFzRm9sZGFibGVMaW5lIHx8XG4gICAgICAgICAgICAvLyBGb2xkYWJsZSBsaW5lID0gdG9vIGxvbmcsIGFuZCBub3QgbW9yZS1pbmRlbnRlZC5cbiAgICAgICAgICAgIChpIC0gcHJldmlvdXNMaW5lQnJlYWsgLSAxID4gbGluZVdpZHRoICYmXG4gICAgICAgICAgICAgIHN0cmluZ1twcmV2aW91c0xpbmVCcmVhayArIDFdICE9PSBcIiBcIik7XG4gICAgICAgICAgcHJldmlvdXNMaW5lQnJlYWsgPSBpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFpc1ByaW50YWJsZShjaGFyKSkge1xuICAgICAgICByZXR1cm4gU1RZTEVfRE9VQkxFO1xuICAgICAgfVxuICAgICAgcGxhaW4gPSBwbGFpbiAmJiBpc1BsYWluU2FmZShjaGFyKTtcbiAgICB9XG4gICAgLy8gaW4gY2FzZSB0aGUgZW5kIGlzIG1pc3NpbmcgYSBcXG5cbiAgICBoYXNGb2xkYWJsZUxpbmUgPSBoYXNGb2xkYWJsZUxpbmUgfHxcbiAgICAgIChzaG91bGRUcmFja1dpZHRoICYmXG4gICAgICAgIGkgLSBwcmV2aW91c0xpbmVCcmVhayAtIDEgPiBsaW5lV2lkdGggJiZcbiAgICAgICAgc3RyaW5nW3ByZXZpb3VzTGluZUJyZWFrICsgMV0gIT09IFwiIFwiKTtcbiAgfVxuICAvLyBBbHRob3VnaCBldmVyeSBzdHlsZSBjYW4gcmVwcmVzZW50IFxcbiB3aXRob3V0IGVzY2FwaW5nLCBwcmVmZXIgYmxvY2sgc3R5bGVzXG4gIC8vIGZvciBtdWx0aWxpbmUsIHNpbmNlIHRoZXkncmUgbW9yZSByZWFkYWJsZSBhbmQgdGhleSBkb24ndCBhZGQgZW1wdHkgbGluZXMuXG4gIC8vIEFsc28gcHJlZmVyIGZvbGRpbmcgYSBzdXBlci1sb25nIGxpbmUuXG4gIGlmICghaGFzTGluZUJyZWFrICYmICFoYXNGb2xkYWJsZUxpbmUpIHtcbiAgICAvLyBTdHJpbmdzIGludGVycHJldGFibGUgYXMgYW5vdGhlciB0eXBlIGhhdmUgdG8gYmUgcXVvdGVkO1xuICAgIC8vIGUuZy4gdGhlIHN0cmluZyAndHJ1ZScgdnMuIHRoZSBib29sZWFuIHRydWUuXG4gICAgcmV0dXJuIHBsYWluICYmICF0ZXN0QW1iaWd1b3VzVHlwZShzdHJpbmcpID8gU1RZTEVfUExBSU4gOiBTVFlMRV9TSU5HTEU7XG4gIH1cbiAgLy8gRWRnZSBjYXNlOiBibG9jayBpbmRlbnRhdGlvbiBpbmRpY2F0b3IgY2FuIG9ubHkgaGF2ZSBvbmUgZGlnaXQuXG4gIGlmIChpbmRlbnRQZXJMZXZlbCA+IDkgJiYgbmVlZEluZGVudEluZGljYXRvcihzdHJpbmcpKSB7XG4gICAgcmV0dXJuIFNUWUxFX0RPVUJMRTtcbiAgfVxuICAvLyBBdCB0aGlzIHBvaW50IHdlIGtub3cgYmxvY2sgc3R5bGVzIGFyZSB2YWxpZC5cbiAgLy8gUHJlZmVyIGxpdGVyYWwgc3R5bGUgdW5sZXNzIHdlIHdhbnQgdG8gZm9sZC5cbiAgcmV0dXJuIGhhc0ZvbGRhYmxlTGluZSA/IFNUWUxFX0ZPTERFRCA6IFNUWUxFX0xJVEVSQUw7XG59XG5cbi8vIEdyZWVkeSBsaW5lIGJyZWFraW5nLlxuLy8gUGlja3MgdGhlIGxvbmdlc3QgbGluZSB1bmRlciB0aGUgbGltaXQgZWFjaCB0aW1lLFxuLy8gb3RoZXJ3aXNlIHNldHRsZXMgZm9yIHRoZSBzaG9ydGVzdCBsaW5lIG92ZXIgdGhlIGxpbWl0LlxuLy8gTkIuIE1vcmUtaW5kZW50ZWQgbGluZXMgKmNhbm5vdCogYmUgZm9sZGVkLCBhcyB0aGF0IHdvdWxkIGFkZCBhbiBleHRyYSBcXG4uXG5mdW5jdGlvbiBmb2xkTGluZShsaW5lOiBzdHJpbmcsIHdpZHRoOiBudW1iZXIpOiBzdHJpbmcge1xuICBpZiAobGluZSA9PT0gXCJcIiB8fCBsaW5lWzBdID09PSBcIiBcIikgcmV0dXJuIGxpbmU7XG5cbiAgLy8gU2luY2UgYSBtb3JlLWluZGVudGVkIGxpbmUgYWRkcyBhIFxcbiwgYnJlYWtzIGNhbid0IGJlIGZvbGxvd2VkIGJ5IGEgc3BhY2UuXG4gIGNvbnN0IGJyZWFrUmUgPSAvIFteIF0vZzsgLy8gbm90ZTogdGhlIG1hdGNoIGluZGV4IHdpbGwgYWx3YXlzIGJlIDw9IGxlbmd0aC0yLlxuICBsZXQgbWF0Y2g7XG4gIC8vIHN0YXJ0IGlzIGFuIGluY2x1c2l2ZSBpbmRleC4gZW5kLCBjdXJyLCBhbmQgbmV4dCBhcmUgZXhjbHVzaXZlLlxuICBsZXQgc3RhcnQgPSAwLFxuICAgIGVuZCxcbiAgICBjdXJyID0gMCxcbiAgICBuZXh0ID0gMDtcbiAgbGV0IHJlc3VsdCA9IFwiXCI7XG5cbiAgLy8gSW52YXJpYW50czogMCA8PSBzdGFydCA8PSBsZW5ndGgtMS5cbiAgLy8gICAwIDw9IGN1cnIgPD0gbmV4dCA8PSBtYXgoMCwgbGVuZ3RoLTIpLiBjdXJyIC0gc3RhcnQgPD0gd2lkdGguXG4gIC8vIEluc2lkZSB0aGUgbG9vcDpcbiAgLy8gICBBIG1hdGNoIGltcGxpZXMgbGVuZ3RoID49IDIsIHNvIGN1cnIgYW5kIG5leHQgYXJlIDw9IGxlbmd0aC0yLlxuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uZGl0aW9uYWwtYXNzaWdubWVudFxuICB3aGlsZSAoKG1hdGNoID0gYnJlYWtSZS5leGVjKGxpbmUpKSkge1xuICAgIG5leHQgPSBtYXRjaC5pbmRleDtcbiAgICAvLyBtYWludGFpbiBpbnZhcmlhbnQ6IGN1cnIgLSBzdGFydCA8PSB3aWR0aFxuICAgIGlmIChuZXh0IC0gc3RhcnQgPiB3aWR0aCkge1xuICAgICAgZW5kID0gY3VyciA+IHN0YXJ0ID8gY3VyciA6IG5leHQ7IC8vIGRlcml2ZSBlbmQgPD0gbGVuZ3RoLTJcbiAgICAgIHJlc3VsdCArPSBgXFxuJHtsaW5lLnNsaWNlKHN0YXJ0LCBlbmQpfWA7XG4gICAgICAvLyBza2lwIHRoZSBzcGFjZSB0aGF0IHdhcyBvdXRwdXQgYXMgXFxuXG4gICAgICBzdGFydCA9IGVuZCArIDE7IC8vIGRlcml2ZSBzdGFydCA8PSBsZW5ndGgtMVxuICAgIH1cbiAgICBjdXJyID0gbmV4dDtcbiAgfVxuXG4gIC8vIEJ5IHRoZSBpbnZhcmlhbnRzLCBzdGFydCA8PSBsZW5ndGgtMSwgc28gdGhlcmUgaXMgc29tZXRoaW5nIGxlZnQgb3Zlci5cbiAgLy8gSXQgaXMgZWl0aGVyIHRoZSB3aG9sZSBzdHJpbmcgb3IgYSBwYXJ0IHN0YXJ0aW5nIGZyb20gbm9uLXdoaXRlc3BhY2UuXG4gIHJlc3VsdCArPSBcIlxcblwiO1xuICAvLyBJbnNlcnQgYSBicmVhayBpZiB0aGUgcmVtYWluZGVyIGlzIHRvbyBsb25nIGFuZCB0aGVyZSBpcyBhIGJyZWFrIGF2YWlsYWJsZS5cbiAgaWYgKGxpbmUubGVuZ3RoIC0gc3RhcnQgPiB3aWR0aCAmJiBjdXJyID4gc3RhcnQpIHtcbiAgICByZXN1bHQgKz0gYCR7bGluZS5zbGljZShzdGFydCwgY3Vycil9XFxuJHtsaW5lLnNsaWNlKGN1cnIgKyAxKX1gO1xuICB9IGVsc2Uge1xuICAgIHJlc3VsdCArPSBsaW5lLnNsaWNlKHN0YXJ0KTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQuc2xpY2UoMSk7IC8vIGRyb3AgZXh0cmEgXFxuIGpvaW5lclxufVxuXG4vLyAoU2VlIHRoZSBub3RlIGZvciB3cml0ZVNjYWxhci4pXG5mdW5jdGlvbiBkcm9wRW5kaW5nTmV3bGluZShzdHJpbmc6IHN0cmluZyk6IHN0cmluZyB7XG4gIHJldHVybiBzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDFdID09PSBcIlxcblwiID8gc3RyaW5nLnNsaWNlKDAsIC0xKSA6IHN0cmluZztcbn1cblxuLy8gTm90ZTogYSBsb25nIGxpbmUgd2l0aG91dCBhIHN1aXRhYmxlIGJyZWFrIHBvaW50IHdpbGwgZXhjZWVkIHRoZSB3aWR0aCBsaW1pdC5cbi8vIFByZS1jb25kaXRpb25zOiBldmVyeSBjaGFyIGluIHN0ciBpc1ByaW50YWJsZSwgc3RyLmxlbmd0aCA+IDAsIHdpZHRoID4gMC5cbmZ1bmN0aW9uIGZvbGRTdHJpbmcoc3RyaW5nOiBzdHJpbmcsIHdpZHRoOiBudW1iZXIpOiBzdHJpbmcge1xuICAvLyBJbiBmb2xkZWQgc3R5bGUsICRrJCBjb25zZWN1dGl2ZSBuZXdsaW5lcyBvdXRwdXQgYXMgJGsrMSQgbmV3bGluZXPigJRcbiAgLy8gdW5sZXNzIHRoZXkncmUgYmVmb3JlIG9yIGFmdGVyIGEgbW9yZS1pbmRlbnRlZCBsaW5lLCBvciBhdCB0aGUgdmVyeVxuICAvLyBiZWdpbm5pbmcgb3IgZW5kLCBpbiB3aGljaCBjYXNlICRrJCBtYXBzIHRvICRrJC5cbiAgLy8gVGhlcmVmb3JlLCBwYXJzZSBlYWNoIGNodW5rIGFzIG5ld2xpbmUocykgZm9sbG93ZWQgYnkgYSBjb250ZW50IGxpbmUuXG4gIGNvbnN0IGxpbmVSZSA9IC8oXFxuKykoW15cXG5dKikvZztcblxuICAvLyBmaXJzdCBsaW5lIChwb3NzaWJseSBhbiBlbXB0eSBsaW5lKVxuICBsZXQgcmVzdWx0ID0gKCgpOiBzdHJpbmcgPT4ge1xuICAgIGxldCBuZXh0TEYgPSBzdHJpbmcuaW5kZXhPZihcIlxcblwiKTtcbiAgICBuZXh0TEYgPSBuZXh0TEYgIT09IC0xID8gbmV4dExGIDogc3RyaW5nLmxlbmd0aDtcbiAgICBsaW5lUmUubGFzdEluZGV4ID0gbmV4dExGO1xuICAgIHJldHVybiBmb2xkTGluZShzdHJpbmcuc2xpY2UoMCwgbmV4dExGKSwgd2lkdGgpO1xuICB9KSgpO1xuICAvLyBJZiB3ZSBoYXZlbid0IHJlYWNoZWQgdGhlIGZpcnN0IGNvbnRlbnQgbGluZSB5ZXQsIGRvbid0IGFkZCBhbiBleHRyYSBcXG4uXG4gIGxldCBwcmV2TW9yZUluZGVudGVkID0gc3RyaW5nWzBdID09PSBcIlxcblwiIHx8IHN0cmluZ1swXSA9PT0gXCIgXCI7XG4gIGxldCBtb3JlSW5kZW50ZWQ7XG5cbiAgLy8gcmVzdCBvZiB0aGUgbGluZXNcbiAgbGV0IG1hdGNoO1xuICAvLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6bm8tY29uZGl0aW9uYWwtYXNzaWdubWVudFxuICB3aGlsZSAoKG1hdGNoID0gbGluZVJlLmV4ZWMoc3RyaW5nKSkpIHtcbiAgICBjb25zdCBwcmVmaXggPSBtYXRjaFsxXSxcbiAgICAgIGxpbmUgPSBtYXRjaFsyXTtcbiAgICBtb3JlSW5kZW50ZWQgPSBsaW5lWzBdID09PSBcIiBcIjtcbiAgICByZXN1bHQgKz0gcHJlZml4ICtcbiAgICAgICghcHJldk1vcmVJbmRlbnRlZCAmJiAhbW9yZUluZGVudGVkICYmIGxpbmUgIT09IFwiXCIgPyBcIlxcblwiIDogXCJcIikgK1xuICAgICAgZm9sZExpbmUobGluZSwgd2lkdGgpO1xuICAgIHByZXZNb3JlSW5kZW50ZWQgPSBtb3JlSW5kZW50ZWQ7XG4gIH1cblxuICByZXR1cm4gcmVzdWx0O1xufVxuXG4vLyBFc2NhcGVzIGEgZG91YmxlLXF1b3RlZCBzdHJpbmcuXG5mdW5jdGlvbiBlc2NhcGVTdHJpbmcoc3RyaW5nOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgcmVzdWx0ID0gXCJcIjtcbiAgbGV0IGNoYXIsIG5leHRDaGFyO1xuICBsZXQgZXNjYXBlU2VxO1xuXG4gIGZvciAobGV0IGkgPSAwOyBpIDwgc3RyaW5nLmxlbmd0aDsgaSsrKSB7XG4gICAgY2hhciA9IHN0cmluZy5jaGFyQ29kZUF0KGkpO1xuICAgIC8vIENoZWNrIGZvciBzdXJyb2dhdGUgcGFpcnMgKHJlZmVyZW5jZSBVbmljb2RlIDMuMCBzZWN0aW9uIFwiMy43IFN1cnJvZ2F0ZXNcIikuXG4gICAgaWYgKGNoYXIgPj0gMHhkODAwICYmIGNoYXIgPD0gMHhkYmZmIC8qIGhpZ2ggc3Vycm9nYXRlICovKSB7XG4gICAgICBuZXh0Q2hhciA9IHN0cmluZy5jaGFyQ29kZUF0KGkgKyAxKTtcbiAgICAgIGlmIChuZXh0Q2hhciA+PSAweGRjMDAgJiYgbmV4dENoYXIgPD0gMHhkZmZmIC8qIGxvdyBzdXJyb2dhdGUgKi8pIHtcbiAgICAgICAgLy8gQ29tYmluZSB0aGUgc3Vycm9nYXRlIHBhaXIgYW5kIHN0b3JlIGl0IGVzY2FwZWQuXG4gICAgICAgIHJlc3VsdCArPSBlbmNvZGVIZXgoXG4gICAgICAgICAgKGNoYXIgLSAweGQ4MDApICogMHg0MDAgKyBuZXh0Q2hhciAtIDB4ZGMwMCArIDB4MTAwMDAsXG4gICAgICAgICk7XG4gICAgICAgIC8vIEFkdmFuY2UgaW5kZXggb25lIGV4dHJhIHNpbmNlIHdlIGFscmVhZHkgdXNlZCB0aGF0IGNoYXIgaGVyZS5cbiAgICAgICAgaSsrO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgZXNjYXBlU2VxID0gRVNDQVBFX1NFUVVFTkNFU1tjaGFyXTtcbiAgICByZXN1bHQgKz0gIWVzY2FwZVNlcSAmJiBpc1ByaW50YWJsZShjaGFyKVxuICAgICAgPyBzdHJpbmdbaV1cbiAgICAgIDogZXNjYXBlU2VxIHx8IGVuY29kZUhleChjaGFyKTtcbiAgfVxuXG4gIHJldHVybiByZXN1bHQ7XG59XG5cbi8vIFByZS1jb25kaXRpb25zOiBzdHJpbmcgaXMgdmFsaWQgZm9yIGEgYmxvY2sgc2NhbGFyLCAxIDw9IGluZGVudFBlckxldmVsIDw9IDkuXG5mdW5jdGlvbiBibG9ja0hlYWRlcihzdHJpbmc6IHN0cmluZywgaW5kZW50UGVyTGV2ZWw6IG51bWJlcik6IHN0cmluZyB7XG4gIGNvbnN0IGluZGVudEluZGljYXRvciA9IG5lZWRJbmRlbnRJbmRpY2F0b3Ioc3RyaW5nKVxuICAgID8gU3RyaW5nKGluZGVudFBlckxldmVsKVxuICAgIDogXCJcIjtcblxuICAvLyBub3RlIHRoZSBzcGVjaWFsIGNhc2U6IHRoZSBzdHJpbmcgJ1xcbicgY291bnRzIGFzIGEgXCJ0cmFpbGluZ1wiIGVtcHR5IGxpbmUuXG4gIGNvbnN0IGNsaXAgPSBzdHJpbmdbc3RyaW5nLmxlbmd0aCAtIDFdID09PSBcIlxcblwiO1xuICBjb25zdCBrZWVwID0gY2xpcCAmJiAoc3RyaW5nW3N0cmluZy5sZW5ndGggLSAyXSA9PT0gXCJcXG5cIiB8fCBzdHJpbmcgPT09IFwiXFxuXCIpO1xuICBjb25zdCBjaG9tcCA9IGtlZXAgPyBcIitcIiA6IGNsaXAgPyBcIlwiIDogXCItXCI7XG5cbiAgcmV0dXJuIGAke2luZGVudEluZGljYXRvcn0ke2Nob21wfVxcbmA7XG59XG5cbi8vIE5vdGU6IGxpbmUgYnJlYWtpbmcvZm9sZGluZyBpcyBpbXBsZW1lbnRlZCBmb3Igb25seSB0aGUgZm9sZGVkIHN0eWxlLlxuLy8gTkIuIFdlIGRyb3AgdGhlIGxhc3QgdHJhaWxpbmcgbmV3bGluZSAoaWYgYW55KSBvZiBhIHJldHVybmVkIGJsb2NrIHNjYWxhclxuLy8gIHNpbmNlIHRoZSBkdW1wZXIgYWRkcyBpdHMgb3duIG5ld2xpbmUuIFRoaXMgYWx3YXlzIHdvcmtzOlxuLy8gICAg4oCiIE5vIGVuZGluZyBuZXdsaW5lID0+IHVuYWZmZWN0ZWQ7IGFscmVhZHkgdXNpbmcgc3RyaXAgXCItXCIgY2hvbXBpbmcuXG4vLyAgICDigKIgRW5kaW5nIG5ld2xpbmUgICAgPT4gcmVtb3ZlZCB0aGVuIHJlc3RvcmVkLlxuLy8gIEltcG9ydGFudGx5LCB0aGlzIGtlZXBzIHRoZSBcIitcIiBjaG9tcCBpbmRpY2F0b3IgZnJvbSBnYWluaW5nIGFuIGV4dHJhIGxpbmUuXG5mdW5jdGlvbiB3cml0ZVNjYWxhcihcbiAgc3RhdGU6IER1bXBlclN0YXRlLFxuICBzdHJpbmc6IHN0cmluZyxcbiAgbGV2ZWw6IG51bWJlcixcbiAgaXNrZXk6IGJvb2xlYW4sXG4pIHtcbiAgc3RhdGUuZHVtcCA9ICgoKTogc3RyaW5nID0+IHtcbiAgICBpZiAoc3RyaW5nLmxlbmd0aCA9PT0gMCkge1xuICAgICAgcmV0dXJuIFwiJydcIjtcbiAgICB9XG4gICAgaWYgKFxuICAgICAgIXN0YXRlLm5vQ29tcGF0TW9kZSAmJlxuICAgICAgREVQUkVDQVRFRF9CT09MRUFOU19TWU5UQVguaW5kZXhPZihzdHJpbmcpICE9PSAtMVxuICAgICkge1xuICAgICAgcmV0dXJuIGAnJHtzdHJpbmd9J2A7XG4gICAgfVxuXG4gICAgY29uc3QgaW5kZW50ID0gc3RhdGUuaW5kZW50ICogTWF0aC5tYXgoMSwgbGV2ZWwpOyAvLyBubyAwLWluZGVudCBzY2FsYXJzXG4gICAgLy8gQXMgaW5kZW50YXRpb24gZ2V0cyBkZWVwZXIsIGxldCB0aGUgd2lkdGggZGVjcmVhc2UgbW9ub3RvbmljYWxseVxuICAgIC8vIHRvIHRoZSBsb3dlciBib3VuZCBtaW4oc3RhdGUubGluZVdpZHRoLCA0MCkuXG4gICAgLy8gTm90ZSB0aGF0IHRoaXMgaW1wbGllc1xuICAgIC8vICBzdGF0ZS5saW5lV2lkdGgg4omkIDQwICsgc3RhdGUuaW5kZW50OiB3aWR0aCBpcyBmaXhlZCBhdCB0aGUgbG93ZXIgYm91bmQuXG4gICAgLy8gIHN0YXRlLmxpbmVXaWR0aCA+IDQwICsgc3RhdGUuaW5kZW50OiB3aWR0aCBkZWNyZWFzZXMgdW50aWwgdGhlIGxvd2VyXG4gICAgLy8gIGJvdW5kLlxuICAgIC8vIFRoaXMgYmVoYXZlcyBiZXR0ZXIgdGhhbiBhIGNvbnN0YW50IG1pbmltdW0gd2lkdGggd2hpY2ggZGlzYWxsb3dzXG4gICAgLy8gbmFycm93ZXIgb3B0aW9ucywgb3IgYW4gaW5kZW50IHRocmVzaG9sZCB3aGljaCBjYXVzZXMgdGhlIHdpZHRoXG4gICAgLy8gdG8gc3VkZGVubHkgaW5jcmVhc2UuXG4gICAgY29uc3QgbGluZVdpZHRoID0gc3RhdGUubGluZVdpZHRoID09PSAtMVxuICAgICAgPyAtMVxuICAgICAgOiBNYXRoLm1heChNYXRoLm1pbihzdGF0ZS5saW5lV2lkdGgsIDQwKSwgc3RhdGUubGluZVdpZHRoIC0gaW5kZW50KTtcblxuICAgIC8vIFdpdGhvdXQga25vd2luZyBpZiBrZXlzIGFyZSBpbXBsaWNpdC9leHBsaWNpdCxcbiAgICAvLyBhc3N1bWUgaW1wbGljaXQgZm9yIHNhZmV0eS5cbiAgICBjb25zdCBzaW5nbGVMaW5lT25seSA9IGlza2V5IHx8XG4gICAgICAvLyBObyBibG9jayBzdHlsZXMgaW4gZmxvdyBtb2RlLlxuICAgICAgKHN0YXRlLmZsb3dMZXZlbCA+IC0xICYmIGxldmVsID49IHN0YXRlLmZsb3dMZXZlbCk7XG4gICAgZnVuY3Rpb24gdGVzdEFtYmlndWl0eShzdHI6IHN0cmluZyk6IGJvb2xlYW4ge1xuICAgICAgcmV0dXJuIHRlc3RJbXBsaWNpdFJlc29sdmluZyhzdGF0ZSwgc3RyKTtcbiAgICB9XG5cbiAgICBzd2l0Y2ggKFxuICAgICAgY2hvb3NlU2NhbGFyU3R5bGUoXG4gICAgICAgIHN0cmluZyxcbiAgICAgICAgc2luZ2xlTGluZU9ubHksXG4gICAgICAgIHN0YXRlLmluZGVudCxcbiAgICAgICAgbGluZVdpZHRoLFxuICAgICAgICB0ZXN0QW1iaWd1aXR5LFxuICAgICAgKVxuICAgICkge1xuICAgICAgY2FzZSBTVFlMRV9QTEFJTjpcbiAgICAgICAgcmV0dXJuIHN0cmluZztcbiAgICAgIGNhc2UgU1RZTEVfU0lOR0xFOlxuICAgICAgICByZXR1cm4gYCcke3N0cmluZy5yZXBsYWNlKC8nL2csIFwiJydcIil9J2A7XG4gICAgICBjYXNlIFNUWUxFX0xJVEVSQUw6XG4gICAgICAgIHJldHVybiBgfCR7YmxvY2tIZWFkZXIoc3RyaW5nLCBzdGF0ZS5pbmRlbnQpfSR7XG4gICAgICAgICAgZHJvcEVuZGluZ05ld2xpbmUoXG4gICAgICAgICAgICBpbmRlbnRTdHJpbmcoc3RyaW5nLCBpbmRlbnQpLFxuICAgICAgICAgIClcbiAgICAgICAgfWA7XG4gICAgICBjYXNlIFNUWUxFX0ZPTERFRDpcbiAgICAgICAgcmV0dXJuIGA+JHtibG9ja0hlYWRlcihzdHJpbmcsIHN0YXRlLmluZGVudCl9JHtcbiAgICAgICAgICBkcm9wRW5kaW5nTmV3bGluZShcbiAgICAgICAgICAgIGluZGVudFN0cmluZyhmb2xkU3RyaW5nKHN0cmluZywgbGluZVdpZHRoKSwgaW5kZW50KSxcbiAgICAgICAgICApXG4gICAgICAgIH1gO1xuICAgICAgY2FzZSBTVFlMRV9ET1VCTEU6XG4gICAgICAgIHJldHVybiBgXCIke2VzY2FwZVN0cmluZyhzdHJpbmcpfVwiYDtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBZQU1MRXJyb3IoXCJpbXBvc3NpYmxlIGVycm9yOiBpbnZhbGlkIHNjYWxhciBzdHlsZVwiKTtcbiAgICB9XG4gIH0pKCk7XG59XG5cbmZ1bmN0aW9uIHdyaXRlRmxvd1NlcXVlbmNlKFxuICBzdGF0ZTogRHVtcGVyU3RhdGUsXG4gIGxldmVsOiBudW1iZXIsXG4gIG9iamVjdDogQW55LFxuKSB7XG4gIGxldCBfcmVzdWx0ID0gXCJcIjtcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZztcblxuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IG9iamVjdC5sZW5ndGg7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSAxKSB7XG4gICAgLy8gV3JpdGUgb25seSB2YWxpZCBlbGVtZW50cy5cbiAgICBpZiAod3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgb2JqZWN0W2luZGV4XSwgZmFsc2UsIGZhbHNlKSkge1xuICAgICAgaWYgKGluZGV4ICE9PSAwKSBfcmVzdWx0ICs9IGAsJHshc3RhdGUuY29uZGVuc2VGbG93ID8gXCIgXCIgOiBcIlwifWA7XG4gICAgICBfcmVzdWx0ICs9IHN0YXRlLmR1bXA7XG4gICAgfVxuICB9XG5cbiAgc3RhdGUudGFnID0gX3RhZztcbiAgc3RhdGUuZHVtcCA9IGBbJHtfcmVzdWx0fV1gO1xufVxuXG5mdW5jdGlvbiB3cml0ZUJsb2NrU2VxdWVuY2UoXG4gIHN0YXRlOiBEdW1wZXJTdGF0ZSxcbiAgbGV2ZWw6IG51bWJlcixcbiAgb2JqZWN0OiBBbnksXG4gIGNvbXBhY3QgPSBmYWxzZSxcbikge1xuICBsZXQgX3Jlc3VsdCA9IFwiXCI7XG4gIGNvbnN0IF90YWcgPSBzdGF0ZS50YWc7XG5cbiAgZm9yIChsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBvYmplY3QubGVuZ3RoOyBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gMSkge1xuICAgIC8vIFdyaXRlIG9ubHkgdmFsaWQgZWxlbWVudHMuXG4gICAgaWYgKHdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBvYmplY3RbaW5kZXhdLCB0cnVlLCB0cnVlKSkge1xuICAgICAgaWYgKCFjb21wYWN0IHx8IGluZGV4ICE9PSAwKSB7XG4gICAgICAgIF9yZXN1bHQgKz0gZ2VuZXJhdGVOZXh0TGluZShzdGF0ZSwgbGV2ZWwpO1xuICAgICAgfVxuXG4gICAgICBpZiAoc3RhdGUuZHVtcCAmJiBDSEFSX0xJTkVfRkVFRCA9PT0gc3RhdGUuZHVtcC5jaGFyQ29kZUF0KDApKSB7XG4gICAgICAgIF9yZXN1bHQgKz0gXCItXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBfcmVzdWx0ICs9IFwiLSBcIjtcbiAgICAgIH1cblxuICAgICAgX3Jlc3VsdCArPSBzdGF0ZS5kdW1wO1xuICAgIH1cbiAgfVxuXG4gIHN0YXRlLnRhZyA9IF90YWc7XG4gIHN0YXRlLmR1bXAgPSBfcmVzdWx0IHx8IFwiW11cIjsgLy8gRW1wdHkgc2VxdWVuY2UgaWYgbm8gdmFsaWQgdmFsdWVzLlxufVxuXG5mdW5jdGlvbiB3cml0ZUZsb3dNYXBwaW5nKFxuICBzdGF0ZTogRHVtcGVyU3RhdGUsXG4gIGxldmVsOiBudW1iZXIsXG4gIG9iamVjdDogQW55LFxuKSB7XG4gIGxldCBfcmVzdWx0ID0gXCJcIjtcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZyxcbiAgICBvYmplY3RLZXlMaXN0ID0gT2JqZWN0LmtleXMob2JqZWN0KTtcblxuICBsZXQgcGFpckJ1ZmZlcjogc3RyaW5nLCBvYmplY3RLZXk6IHN0cmluZywgb2JqZWN0VmFsdWU6IEFueTtcbiAgZm9yIChcbiAgICBsZXQgaW5kZXggPSAwLCBsZW5ndGggPSBvYmplY3RLZXlMaXN0Lmxlbmd0aDtcbiAgICBpbmRleCA8IGxlbmd0aDtcbiAgICBpbmRleCArPSAxXG4gICkge1xuICAgIHBhaXJCdWZmZXIgPSBzdGF0ZS5jb25kZW5zZUZsb3cgPyAnXCInIDogXCJcIjtcblxuICAgIGlmIChpbmRleCAhPT0gMCkgcGFpckJ1ZmZlciArPSBcIiwgXCI7XG5cbiAgICBvYmplY3RLZXkgPSBvYmplY3RLZXlMaXN0W2luZGV4XTtcbiAgICBvYmplY3RWYWx1ZSA9IG9iamVjdFtvYmplY3RLZXldO1xuXG4gICAgaWYgKCF3cml0ZU5vZGUoc3RhdGUsIGxldmVsLCBvYmplY3RLZXksIGZhbHNlLCBmYWxzZSkpIHtcbiAgICAgIGNvbnRpbnVlOyAvLyBTa2lwIHRoaXMgcGFpciBiZWNhdXNlIG9mIGludmFsaWQga2V5O1xuICAgIH1cblxuICAgIGlmIChzdGF0ZS5kdW1wLmxlbmd0aCA+IDEwMjQpIHBhaXJCdWZmZXIgKz0gXCI/IFwiO1xuXG4gICAgcGFpckJ1ZmZlciArPSBgJHtzdGF0ZS5kdW1wfSR7c3RhdGUuY29uZGVuc2VGbG93ID8gJ1wiJyA6IFwiXCJ9OiR7XG4gICAgICBzdGF0ZS5jb25kZW5zZUZsb3cgPyBcIlwiIDogXCIgXCJcbiAgICB9YDtcblxuICAgIGlmICghd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCwgb2JqZWN0VmFsdWUsIGZhbHNlLCBmYWxzZSkpIHtcbiAgICAgIGNvbnRpbnVlOyAvLyBTa2lwIHRoaXMgcGFpciBiZWNhdXNlIG9mIGludmFsaWQgdmFsdWUuXG4gICAgfVxuXG4gICAgcGFpckJ1ZmZlciArPSBzdGF0ZS5kdW1wO1xuXG4gICAgLy8gQm90aCBrZXkgYW5kIHZhbHVlIGFyZSB2YWxpZC5cbiAgICBfcmVzdWx0ICs9IHBhaXJCdWZmZXI7XG4gIH1cblxuICBzdGF0ZS50YWcgPSBfdGFnO1xuICBzdGF0ZS5kdW1wID0gYHske19yZXN1bHR9fWA7XG59XG5cbmZ1bmN0aW9uIHdyaXRlQmxvY2tNYXBwaW5nKFxuICBzdGF0ZTogRHVtcGVyU3RhdGUsXG4gIGxldmVsOiBudW1iZXIsXG4gIG9iamVjdDogQW55LFxuICBjb21wYWN0ID0gZmFsc2UsXG4pIHtcbiAgY29uc3QgX3RhZyA9IHN0YXRlLnRhZyxcbiAgICBvYmplY3RLZXlMaXN0ID0gT2JqZWN0LmtleXMob2JqZWN0KTtcbiAgbGV0IF9yZXN1bHQgPSBcIlwiO1xuXG4gIC8vIEFsbG93IHNvcnRpbmcga2V5cyBzbyB0aGF0IHRoZSBvdXRwdXQgZmlsZSBpcyBkZXRlcm1pbmlzdGljXG4gIGlmIChzdGF0ZS5zb3J0S2V5cyA9PT0gdHJ1ZSkge1xuICAgIC8vIERlZmF1bHQgc29ydGluZ1xuICAgIG9iamVjdEtleUxpc3Quc29ydCgpO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzdGF0ZS5zb3J0S2V5cyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgLy8gQ3VzdG9tIHNvcnQgZnVuY3Rpb25cbiAgICBvYmplY3RLZXlMaXN0LnNvcnQoc3RhdGUuc29ydEtleXMpO1xuICB9IGVsc2UgaWYgKHN0YXRlLnNvcnRLZXlzKSB7XG4gICAgLy8gU29tZXRoaW5nIGlzIHdyb25nXG4gICAgdGhyb3cgbmV3IFlBTUxFcnJvcihcInNvcnRLZXlzIG11c3QgYmUgYSBib29sZWFuIG9yIGEgZnVuY3Rpb25cIik7XG4gIH1cblxuICBsZXQgcGFpckJ1ZmZlciA9IFwiXCIsXG4gICAgb2JqZWN0S2V5OiBzdHJpbmcsXG4gICAgb2JqZWN0VmFsdWU6IEFueSxcbiAgICBleHBsaWNpdFBhaXI6IGJvb2xlYW47XG4gIGZvciAoXG4gICAgbGV0IGluZGV4ID0gMCwgbGVuZ3RoID0gb2JqZWN0S2V5TGlzdC5sZW5ndGg7XG4gICAgaW5kZXggPCBsZW5ndGg7XG4gICAgaW5kZXggKz0gMVxuICApIHtcbiAgICBwYWlyQnVmZmVyID0gXCJcIjtcblxuICAgIGlmICghY29tcGFjdCB8fCBpbmRleCAhPT0gMCkge1xuICAgICAgcGFpckJ1ZmZlciArPSBnZW5lcmF0ZU5leHRMaW5lKHN0YXRlLCBsZXZlbCk7XG4gICAgfVxuXG4gICAgb2JqZWN0S2V5ID0gb2JqZWN0S2V5TGlzdFtpbmRleF07XG4gICAgb2JqZWN0VmFsdWUgPSBvYmplY3Rbb2JqZWN0S2V5XTtcblxuICAgIGlmICghd3JpdGVOb2RlKHN0YXRlLCBsZXZlbCArIDEsIG9iamVjdEtleSwgdHJ1ZSwgdHJ1ZSwgdHJ1ZSkpIHtcbiAgICAgIGNvbnRpbnVlOyAvLyBTa2lwIHRoaXMgcGFpciBiZWNhdXNlIG9mIGludmFsaWQga2V5LlxuICAgIH1cblxuICAgIGV4cGxpY2l0UGFpciA9IChzdGF0ZS50YWcgIT09IG51bGwgJiYgc3RhdGUudGFnICE9PSBcIj9cIikgfHxcbiAgICAgIChzdGF0ZS5kdW1wICYmIHN0YXRlLmR1bXAubGVuZ3RoID4gMTAyNCk7XG5cbiAgICBpZiAoZXhwbGljaXRQYWlyKSB7XG4gICAgICBpZiAoc3RhdGUuZHVtcCAmJiBDSEFSX0xJTkVfRkVFRCA9PT0gc3RhdGUuZHVtcC5jaGFyQ29kZUF0KDApKSB7XG4gICAgICAgIHBhaXJCdWZmZXIgKz0gXCI/XCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwYWlyQnVmZmVyICs9IFwiPyBcIjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBwYWlyQnVmZmVyICs9IHN0YXRlLmR1bXA7XG5cbiAgICBpZiAoZXhwbGljaXRQYWlyKSB7XG4gICAgICBwYWlyQnVmZmVyICs9IGdlbmVyYXRlTmV4dExpbmUoc3RhdGUsIGxldmVsKTtcbiAgICB9XG5cbiAgICBpZiAoIXdyaXRlTm9kZShzdGF0ZSwgbGV2ZWwgKyAxLCBvYmplY3RWYWx1ZSwgdHJ1ZSwgZXhwbGljaXRQYWlyKSkge1xuICAgICAgY29udGludWU7IC8vIFNraXAgdGhpcyBwYWlyIGJlY2F1c2Ugb2YgaW52YWxpZCB2YWx1ZS5cbiAgICB9XG5cbiAgICBpZiAoc3RhdGUuZHVtcCAmJiBDSEFSX0xJTkVfRkVFRCA9PT0gc3RhdGUuZHVtcC5jaGFyQ29kZUF0KDApKSB7XG4gICAgICBwYWlyQnVmZmVyICs9IFwiOlwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBwYWlyQnVmZmVyICs9IFwiOiBcIjtcbiAgICB9XG5cbiAgICBwYWlyQnVmZmVyICs9IHN0YXRlLmR1bXA7XG5cbiAgICAvLyBCb3RoIGtleSBhbmQgdmFsdWUgYXJlIHZhbGlkLlxuICAgIF9yZXN1bHQgKz0gcGFpckJ1ZmZlcjtcbiAgfVxuXG4gIHN0YXRlLnRhZyA9IF90YWc7XG4gIHN0YXRlLmR1bXAgPSBfcmVzdWx0IHx8IFwie31cIjsgLy8gRW1wdHkgbWFwcGluZyBpZiBubyB2YWxpZCBwYWlycy5cbn1cblxuZnVuY3Rpb24gZGV0ZWN0VHlwZShcbiAgc3RhdGU6IER1bXBlclN0YXRlLFxuICBvYmplY3Q6IEFueSxcbiAgZXhwbGljaXQgPSBmYWxzZSxcbik6IGJvb2xlYW4ge1xuICBjb25zdCB0eXBlTGlzdCA9IGV4cGxpY2l0ID8gc3RhdGUuZXhwbGljaXRUeXBlcyA6IHN0YXRlLmltcGxpY2l0VHlwZXM7XG5cbiAgbGV0IHR5cGU6IFR5cGU7XG4gIGxldCBzdHlsZTogU3R5bGVWYXJpYW50O1xuICBsZXQgX3Jlc3VsdDogc3RyaW5nO1xuICBmb3IgKGxldCBpbmRleCA9IDAsIGxlbmd0aCA9IHR5cGVMaXN0Lmxlbmd0aDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICB0eXBlID0gdHlwZUxpc3RbaW5kZXhdO1xuXG4gICAgaWYgKFxuICAgICAgKHR5cGUuaW5zdGFuY2VPZiB8fCB0eXBlLnByZWRpY2F0ZSkgJiZcbiAgICAgICghdHlwZS5pbnN0YW5jZU9mIHx8XG4gICAgICAgICh0eXBlb2Ygb2JqZWN0ID09PSBcIm9iamVjdFwiICYmIG9iamVjdCBpbnN0YW5jZW9mIHR5cGUuaW5zdGFuY2VPZikpICYmXG4gICAgICAoIXR5cGUucHJlZGljYXRlIHx8IHR5cGUucHJlZGljYXRlKG9iamVjdCkpXG4gICAgKSB7XG4gICAgICBzdGF0ZS50YWcgPSBleHBsaWNpdCA/IHR5cGUudGFnIDogXCI/XCI7XG5cbiAgICAgIGlmICh0eXBlLnJlcHJlc2VudCkge1xuICAgICAgICBzdHlsZSA9IHN0YXRlLnN0eWxlTWFwW3R5cGUudGFnXSB8fCB0eXBlLmRlZmF1bHRTdHlsZTtcblxuICAgICAgICBpZiAoX3RvU3RyaW5nLmNhbGwodHlwZS5yZXByZXNlbnQpID09PSBcIltvYmplY3QgRnVuY3Rpb25dXCIpIHtcbiAgICAgICAgICBfcmVzdWx0ID0gKHR5cGUucmVwcmVzZW50IGFzIFJlcHJlc2VudEZuKShvYmplY3QsIHN0eWxlKTtcbiAgICAgICAgfSBlbHNlIGlmIChoYXNPd24odHlwZS5yZXByZXNlbnQsIHN0eWxlKSkge1xuICAgICAgICAgIF9yZXN1bHQgPSAodHlwZS5yZXByZXNlbnQgYXMgQXJyYXlPYmplY3Q8UmVwcmVzZW50Rm4+KVtzdHlsZV0oXG4gICAgICAgICAgICBvYmplY3QsXG4gICAgICAgICAgICBzdHlsZSxcbiAgICAgICAgICApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHRocm93IG5ldyBZQU1MRXJyb3IoXG4gICAgICAgICAgICBgITwke3R5cGUudGFnfT4gdGFnIHJlc29sdmVyIGFjY2VwdHMgbm90IFwiJHtzdHlsZX1cIiBzdHlsZWAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHN0YXRlLmR1bXAgPSBfcmVzdWx0O1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gZmFsc2U7XG59XG5cbi8vIFNlcmlhbGl6ZXMgYG9iamVjdGAgYW5kIHdyaXRlcyBpdCB0byBnbG9iYWwgYHJlc3VsdGAuXG4vLyBSZXR1cm5zIHRydWUgb24gc3VjY2Vzcywgb3IgZmFsc2Ugb24gaW52YWxpZCBvYmplY3QuXG4vL1xuZnVuY3Rpb24gd3JpdGVOb2RlKFxuICBzdGF0ZTogRHVtcGVyU3RhdGUsXG4gIGxldmVsOiBudW1iZXIsXG4gIG9iamVjdDogQW55LFxuICBibG9jazogYm9vbGVhbixcbiAgY29tcGFjdDogYm9vbGVhbixcbiAgaXNrZXkgPSBmYWxzZSxcbik6IGJvb2xlYW4ge1xuICBzdGF0ZS50YWcgPSBudWxsO1xuICBzdGF0ZS5kdW1wID0gb2JqZWN0O1xuXG4gIGlmICghZGV0ZWN0VHlwZShzdGF0ZSwgb2JqZWN0LCBmYWxzZSkpIHtcbiAgICBkZXRlY3RUeXBlKHN0YXRlLCBvYmplY3QsIHRydWUpO1xuICB9XG5cbiAgY29uc3QgdHlwZSA9IF90b1N0cmluZy5jYWxsKHN0YXRlLmR1bXApO1xuXG4gIGlmIChibG9jaykge1xuICAgIGJsb2NrID0gc3RhdGUuZmxvd0xldmVsIDwgMCB8fCBzdGF0ZS5mbG93TGV2ZWwgPiBsZXZlbDtcbiAgfVxuXG4gIGNvbnN0IG9iamVjdE9yQXJyYXkgPSB0eXBlID09PSBcIltvYmplY3QgT2JqZWN0XVwiIHx8IHR5cGUgPT09IFwiW29iamVjdCBBcnJheV1cIjtcblxuICBsZXQgZHVwbGljYXRlSW5kZXggPSAtMTtcbiAgbGV0IGR1cGxpY2F0ZSA9IGZhbHNlO1xuICBpZiAob2JqZWN0T3JBcnJheSkge1xuICAgIGR1cGxpY2F0ZUluZGV4ID0gc3RhdGUuZHVwbGljYXRlcy5pbmRleE9mKG9iamVjdCk7XG4gICAgZHVwbGljYXRlID0gZHVwbGljYXRlSW5kZXggIT09IC0xO1xuICB9XG5cbiAgaWYgKFxuICAgIChzdGF0ZS50YWcgIT09IG51bGwgJiYgc3RhdGUudGFnICE9PSBcIj9cIikgfHxcbiAgICBkdXBsaWNhdGUgfHxcbiAgICAoc3RhdGUuaW5kZW50ICE9PSAyICYmIGxldmVsID4gMClcbiAgKSB7XG4gICAgY29tcGFjdCA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKGR1cGxpY2F0ZSAmJiBzdGF0ZS51c2VkRHVwbGljYXRlc1tkdXBsaWNhdGVJbmRleF0pIHtcbiAgICBzdGF0ZS5kdW1wID0gYCpyZWZfJHtkdXBsaWNhdGVJbmRleH1gO1xuICB9IGVsc2Uge1xuICAgIGlmIChvYmplY3RPckFycmF5ICYmIGR1cGxpY2F0ZSAmJiAhc3RhdGUudXNlZER1cGxpY2F0ZXNbZHVwbGljYXRlSW5kZXhdKSB7XG4gICAgICBzdGF0ZS51c2VkRHVwbGljYXRlc1tkdXBsaWNhdGVJbmRleF0gPSB0cnVlO1xuICAgIH1cbiAgICBpZiAodHlwZSA9PT0gXCJbb2JqZWN0IE9iamVjdF1cIikge1xuICAgICAgaWYgKGJsb2NrICYmIE9iamVjdC5rZXlzKHN0YXRlLmR1bXApLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICB3cml0ZUJsb2NrTWFwcGluZyhzdGF0ZSwgbGV2ZWwsIHN0YXRlLmR1bXAsIGNvbXBhY3QpO1xuICAgICAgICBpZiAoZHVwbGljYXRlKSB7XG4gICAgICAgICAgc3RhdGUuZHVtcCA9IGAmcmVmXyR7ZHVwbGljYXRlSW5kZXh9JHtzdGF0ZS5kdW1wfWA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdyaXRlRmxvd01hcHBpbmcoc3RhdGUsIGxldmVsLCBzdGF0ZS5kdW1wKTtcbiAgICAgICAgaWYgKGR1cGxpY2F0ZSkge1xuICAgICAgICAgIHN0YXRlLmR1bXAgPSBgJnJlZl8ke2R1cGxpY2F0ZUluZGV4fSAke3N0YXRlLmR1bXB9YDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgICBjb25zdCBhcnJheUxldmVsID0gc3RhdGUubm9BcnJheUluZGVudCAmJiBsZXZlbCA+IDAgPyBsZXZlbCAtIDEgOiBsZXZlbDtcbiAgICAgIGlmIChibG9jayAmJiBzdGF0ZS5kdW1wLmxlbmd0aCAhPT0gMCkge1xuICAgICAgICB3cml0ZUJsb2NrU2VxdWVuY2Uoc3RhdGUsIGFycmF5TGV2ZWwsIHN0YXRlLmR1bXAsIGNvbXBhY3QpO1xuICAgICAgICBpZiAoZHVwbGljYXRlKSB7XG4gICAgICAgICAgc3RhdGUuZHVtcCA9IGAmcmVmXyR7ZHVwbGljYXRlSW5kZXh9JHtzdGF0ZS5kdW1wfWA7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHdyaXRlRmxvd1NlcXVlbmNlKHN0YXRlLCBhcnJheUxldmVsLCBzdGF0ZS5kdW1wKTtcbiAgICAgICAgaWYgKGR1cGxpY2F0ZSkge1xuICAgICAgICAgIHN0YXRlLmR1bXAgPSBgJnJlZl8ke2R1cGxpY2F0ZUluZGV4fSAke3N0YXRlLmR1bXB9YDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gXCJbb2JqZWN0IFN0cmluZ11cIikge1xuICAgICAgaWYgKHN0YXRlLnRhZyAhPT0gXCI/XCIpIHtcbiAgICAgICAgd3JpdGVTY2FsYXIoc3RhdGUsIHN0YXRlLmR1bXAsIGxldmVsLCBpc2tleSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmIChzdGF0ZS5za2lwSW52YWxpZCkgcmV0dXJuIGZhbHNlO1xuICAgICAgdGhyb3cgbmV3IFlBTUxFcnJvcihgdW5hY2NlcHRhYmxlIGtpbmQgb2YgYW4gb2JqZWN0IHRvIGR1bXAgJHt0eXBlfWApO1xuICAgIH1cblxuICAgIGlmIChzdGF0ZS50YWcgIT09IG51bGwgJiYgc3RhdGUudGFnICE9PSBcIj9cIikge1xuICAgICAgc3RhdGUuZHVtcCA9IGAhPCR7c3RhdGUudGFnfT4gJHtzdGF0ZS5kdW1wfWA7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHRydWU7XG59XG5cbmZ1bmN0aW9uIGluc3BlY3ROb2RlKFxuICBvYmplY3Q6IEFueSxcbiAgb2JqZWN0czogQW55W10sXG4gIGR1cGxpY2F0ZXNJbmRleGVzOiBudW1iZXJbXSxcbikge1xuICBpZiAob2JqZWN0ICE9PSBudWxsICYmIHR5cGVvZiBvYmplY3QgPT09IFwib2JqZWN0XCIpIHtcbiAgICBjb25zdCBpbmRleCA9IG9iamVjdHMuaW5kZXhPZihvYmplY3QpO1xuICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgIGlmIChkdXBsaWNhdGVzSW5kZXhlcy5pbmRleE9mKGluZGV4KSA9PT0gLTEpIHtcbiAgICAgICAgZHVwbGljYXRlc0luZGV4ZXMucHVzaChpbmRleCk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIG9iamVjdHMucHVzaChvYmplY3QpO1xuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShvYmplY3QpKSB7XG4gICAgICAgIGZvciAobGV0IGlkeCA9IDAsIGxlbmd0aCA9IG9iamVjdC5sZW5ndGg7IGlkeCA8IGxlbmd0aDsgaWR4ICs9IDEpIHtcbiAgICAgICAgICBpbnNwZWN0Tm9kZShvYmplY3RbaWR4XSwgb2JqZWN0cywgZHVwbGljYXRlc0luZGV4ZXMpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zdCBvYmplY3RLZXlMaXN0ID0gT2JqZWN0LmtleXMob2JqZWN0KTtcblxuICAgICAgICBmb3IgKFxuICAgICAgICAgIGxldCBpZHggPSAwLCBsZW5ndGggPSBvYmplY3RLZXlMaXN0Lmxlbmd0aDtcbiAgICAgICAgICBpZHggPCBsZW5ndGg7XG4gICAgICAgICAgaWR4ICs9IDFcbiAgICAgICAgKSB7XG4gICAgICAgICAgaW5zcGVjdE5vZGUob2JqZWN0W29iamVjdEtleUxpc3RbaWR4XV0sIG9iamVjdHMsIGR1cGxpY2F0ZXNJbmRleGVzKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBnZXREdXBsaWNhdGVSZWZlcmVuY2VzKFxuICBvYmplY3Q6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuICBzdGF0ZTogRHVtcGVyU3RhdGUsXG4pIHtcbiAgY29uc3Qgb2JqZWN0czogQW55W10gPSBbXSxcbiAgICBkdXBsaWNhdGVzSW5kZXhlczogbnVtYmVyW10gPSBbXTtcblxuICBpbnNwZWN0Tm9kZShvYmplY3QsIG9iamVjdHMsIGR1cGxpY2F0ZXNJbmRleGVzKTtcblxuICBjb25zdCBsZW5ndGggPSBkdXBsaWNhdGVzSW5kZXhlcy5sZW5ndGg7XG4gIGZvciAobGV0IGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IDEpIHtcbiAgICBzdGF0ZS5kdXBsaWNhdGVzLnB1c2gob2JqZWN0c1tkdXBsaWNhdGVzSW5kZXhlc1tpbmRleF1dKTtcbiAgfVxuICBzdGF0ZS51c2VkRHVwbGljYXRlcyA9IEFycmF5LmZyb20oeyBsZW5ndGggfSk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkdW1wKGlucHV0OiBBbnksIG9wdGlvbnM/OiBEdW1wZXJTdGF0ZU9wdGlvbnMpOiBzdHJpbmcge1xuICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICBjb25zdCBzdGF0ZSA9IG5ldyBEdW1wZXJTdGF0ZShvcHRpb25zKTtcblxuICBpZiAoIXN0YXRlLm5vUmVmcykgZ2V0RHVwbGljYXRlUmVmZXJlbmNlcyhpbnB1dCwgc3RhdGUpO1xuXG4gIGlmICh3cml0ZU5vZGUoc3RhdGUsIDAsIGlucHV0LCB0cnVlLCB0cnVlKSkgcmV0dXJuIGAke3N0YXRlLmR1bXB9XFxuYDtcblxuICByZXR1cm4gXCJcIjtcbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFFMUUsU0FBUyxTQUFTLFFBQVEsY0FBYztBQUV4QyxZQUFZLFlBQVksY0FBYztBQUN0QyxTQUFTLFdBQVcsUUFBNEIsb0JBQW9CO0FBS3BFLE1BQU0sWUFBWSxPQUFPLFNBQVMsQ0FBQyxRQUFRO0FBQzNDLE1BQU0sRUFBRSxPQUFNLEVBQUUsR0FBRztBQUVuQixNQUFNLFdBQVcsTUFBTSxPQUFPO0FBQzlCLE1BQU0saUJBQWlCLE1BQU0sTUFBTTtBQUNuQyxNQUFNLGFBQWEsTUFBTSxTQUFTO0FBQ2xDLE1BQU0sbUJBQW1CLE1BQU0sS0FBSztBQUNwQyxNQUFNLG9CQUFvQixNQUFNLEtBQUs7QUFDckMsTUFBTSxhQUFhLE1BQU0sS0FBSztBQUM5QixNQUFNLGVBQWUsTUFBTSxLQUFLO0FBQ2hDLE1BQU0saUJBQWlCLE1BQU0sS0FBSztBQUNsQyxNQUFNLG9CQUFvQixNQUFNLEtBQUs7QUFDckMsTUFBTSxnQkFBZ0IsTUFBTSxLQUFLO0FBQ2pDLE1BQU0sYUFBYSxNQUFNLEtBQUs7QUFDOUIsTUFBTSxhQUFhLE1BQU0sS0FBSztBQUM5QixNQUFNLGFBQWEsTUFBTSxLQUFLO0FBQzlCLE1BQU0sb0JBQW9CLE1BQU0sS0FBSztBQUNyQyxNQUFNLGdCQUFnQixNQUFNLEtBQUs7QUFDakMsTUFBTSxxQkFBcUIsTUFBTSxLQUFLO0FBQ3RDLE1BQU0sMkJBQTJCLE1BQU0sS0FBSztBQUM1QyxNQUFNLDRCQUE0QixNQUFNLEtBQUs7QUFDN0MsTUFBTSxvQkFBb0IsTUFBTSxLQUFLO0FBQ3JDLE1BQU0sMEJBQTBCLE1BQU0sS0FBSztBQUMzQyxNQUFNLHFCQUFxQixNQUFNLEtBQUs7QUFDdEMsTUFBTSwyQkFBMkIsTUFBTSxLQUFLO0FBRTVDLE1BQU0sbUJBQStDLENBQUM7QUFFdEQsZ0JBQWdCLENBQUMsS0FBSyxHQUFHO0FBQ3pCLGdCQUFnQixDQUFDLEtBQUssR0FBRztBQUN6QixnQkFBZ0IsQ0FBQyxLQUFLLEdBQUc7QUFDekIsZ0JBQWdCLENBQUMsS0FBSyxHQUFHO0FBQ3pCLGdCQUFnQixDQUFDLEtBQUssR0FBRztBQUN6QixnQkFBZ0IsQ0FBQyxLQUFLLEdBQUc7QUFDekIsZ0JBQWdCLENBQUMsS0FBSyxHQUFHO0FBQ3pCLGdCQUFnQixDQUFDLEtBQUssR0FBRztBQUN6QixnQkFBZ0IsQ0FBQyxLQUFLLEdBQUc7QUFDekIsZ0JBQWdCLENBQUMsS0FBSyxHQUFHO0FBQ3pCLGdCQUFnQixDQUFDLEtBQUssR0FBRztBQUN6QixnQkFBZ0IsQ0FBQyxLQUFLLEdBQUc7QUFDekIsZ0JBQWdCLENBQUMsS0FBSyxHQUFHO0FBQ3pCLGdCQUFnQixDQUFDLE9BQU8sR0FBRztBQUMzQixnQkFBZ0IsQ0FBQyxPQUFPLEdBQUc7QUFFM0IsTUFBTSw2QkFBNkI7SUFDakM7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7Q0FDRDtBQUVELFNBQVMsVUFBVSxTQUFpQixFQUFVO0lBQzVDLE1BQU0sU0FBUyxVQUFVLFFBQVEsQ0FBQyxJQUFJLFdBQVc7SUFFakQsSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJLGFBQWEsTUFBTTtRQUNyQixTQUFTO1FBQ1QsU0FBUztJQUNYLE9BQU8sSUFBSSxhQUFhLFFBQVE7UUFDOUIsU0FBUztRQUNULFNBQVM7SUFDWCxPQUFPLElBQUksYUFBYSxZQUFZO1FBQ2xDLFNBQVM7UUFDVCxTQUFTO0lBQ1gsT0FBTztRQUNMLE1BQU0sSUFBSSxVQUNSLGlFQUNBO0lBQ0osQ0FBQztJQUVELE9BQU8sQ0FBQyxFQUFFLEVBQUUsT0FBTyxFQUFFLE9BQU8sTUFBTSxDQUFDLEtBQUssU0FBUyxPQUFPLE1BQU0sRUFBRSxFQUFFLE9BQU8sQ0FBQztBQUM1RTtBQUVBLDBFQUEwRTtBQUMxRSxTQUFTLGFBQWEsTUFBYyxFQUFFLE1BQWMsRUFBVTtJQUM1RCxNQUFNLE1BQU0sT0FBTyxNQUFNLENBQUMsS0FBSyxTQUM3QixTQUFTLE9BQU8sTUFBTTtJQUN4QixJQUFJLFdBQVcsR0FDYixPQUFPLENBQUMsR0FDUixTQUFTLElBQ1Q7SUFFRixNQUFPLFdBQVcsT0FBUTtRQUN4QixPQUFPLE9BQU8sT0FBTyxDQUFDLE1BQU07UUFDNUIsSUFBSSxTQUFTLENBQUMsR0FBRztZQUNmLE9BQU8sT0FBTyxLQUFLLENBQUM7WUFDcEIsV0FBVztRQUNiLE9BQU87WUFDTCxPQUFPLE9BQU8sS0FBSyxDQUFDLFVBQVUsT0FBTztZQUNyQyxXQUFXLE9BQU87UUFDcEIsQ0FBQztRQUVELElBQUksS0FBSyxNQUFNLElBQUksU0FBUyxNQUFNLFVBQVU7UUFFNUMsVUFBVTtJQUNaO0lBRUEsT0FBTztBQUNUO0FBRUEsU0FBUyxpQkFBaUIsS0FBa0IsRUFBRSxLQUFhLEVBQVU7SUFDbkUsT0FBTyxDQUFDLEVBQUUsRUFBRSxPQUFPLE1BQU0sQ0FBQyxLQUFLLE1BQU0sTUFBTSxHQUFHLE9BQU8sQ0FBQztBQUN4RDtBQUVBLFNBQVMsc0JBQXNCLEtBQWtCLEVBQUUsR0FBVyxFQUFXO0lBQ3ZFLElBQUk7SUFDSixJQUNFLElBQUksUUFBUSxHQUFHLFNBQVMsTUFBTSxhQUFhLENBQUMsTUFBTSxFQUNsRCxRQUFRLFFBQ1IsU0FBUyxFQUNUO1FBQ0EsT0FBTyxNQUFNLGFBQWEsQ0FBQyxNQUFNO1FBRWpDLElBQUksS0FBSyxPQUFPLENBQUMsTUFBTTtZQUNyQixPQUFPLElBQUk7UUFDYixDQUFDO0lBQ0g7SUFFQSxPQUFPLEtBQUs7QUFDZDtBQUVBLG1DQUFtQztBQUNuQyxTQUFTLGFBQWEsQ0FBUyxFQUFXO0lBQ3hDLE9BQU8sTUFBTSxjQUFjLE1BQU07QUFDbkM7QUFFQSxpRUFBaUU7QUFDakUsbUVBQW1FO0FBQ25FLDJEQUEyRDtBQUMzRCw2REFBNkQ7QUFDN0QsU0FBUyxZQUFZLENBQVMsRUFBVztJQUN2QyxPQUNFLEFBQUMsV0FBVyxLQUFLLEtBQUssWUFDckIsV0FBVyxLQUFLLEtBQUssWUFBWSxNQUFNLFVBQVUsTUFBTSxVQUN2RCxXQUFXLEtBQUssS0FBSyxZQUFZLE1BQU0sVUFDdkMsV0FBVyxLQUFLLEtBQUs7QUFFMUI7QUFFQSwrRUFBK0U7QUFDL0UsU0FBUyxZQUFZLENBQVMsRUFBVztJQUN2QywwREFBMEQ7SUFDMUQsOERBQThEO0lBQzlELE9BQ0UsWUFBWSxNQUNaLE1BQU0sVUFDTixxQkFBcUI7SUFDckIsTUFBTSxjQUNOLE1BQU0sNEJBQ04sTUFBTSw2QkFDTixNQUFNLDJCQUNOLE1BQU0sNEJBQ04sY0FBYztJQUNkLE1BQU0sY0FDTixNQUFNO0FBRVY7QUFFQSw0RUFBNEU7QUFDNUUsU0FBUyxpQkFBaUIsQ0FBUyxFQUFXO0lBQzVDLHlDQUF5QztJQUN6QyxxQ0FBcUM7SUFDckMsT0FDRSxZQUFZLE1BQ1osTUFBTSxVQUNOLENBQUMsYUFBYSxNQUFNLFlBQVk7SUFDaEMscUJBQXFCO0lBQ3JCLGdEQUFnRDtJQUNoRCxNQUFNLGNBQ04sTUFBTSxpQkFDTixNQUFNLGNBQ04sTUFBTSxjQUNOLE1BQU0sNEJBQ04sTUFBTSw2QkFDTixNQUFNLDJCQUNOLE1BQU0sNEJBQ04sa0RBQWtEO0lBQ2xELE1BQU0sY0FDTixNQUFNLGtCQUNOLE1BQU0saUJBQ04sTUFBTSxvQkFDTixNQUFNLHNCQUNOLE1BQU0scUJBQ04sTUFBTSxxQkFDTixNQUFNLHFCQUNOLHFCQUFxQjtJQUNyQixNQUFNLGdCQUNOLE1BQU0sc0JBQ04sTUFBTTtBQUVWO0FBRUEsOERBQThEO0FBQzlELFNBQVMsb0JBQW9CLE1BQWMsRUFBVztJQUNwRCxNQUFNLGlCQUFpQjtJQUN2QixPQUFPLGVBQWUsSUFBSSxDQUFDO0FBQzdCO0FBRUEsTUFBTSxjQUFjLEdBQ2xCLGVBQWUsR0FDZixnQkFBZ0IsR0FDaEIsZUFBZSxHQUNmLGVBQWU7QUFFakIsK0VBQStFO0FBQy9FLDhCQUE4QjtBQUM5QixrQ0FBa0M7QUFDbEMsbUJBQW1CO0FBQ25CLDJEQUEyRDtBQUMzRCw0RUFBNEU7QUFDNUUsK0VBQStFO0FBQy9FLFNBQVMsa0JBQ1AsTUFBYyxFQUNkLGNBQXVCLEVBQ3ZCLGNBQXNCLEVBQ3RCLFNBQWlCLEVBQ2pCLGlCQUEwQyxFQUNsQztJQUNSLE1BQU0sbUJBQW1CLGNBQWMsQ0FBQztJQUN4QyxJQUFJLGVBQWUsS0FBSyxFQUN0QixrQkFBa0IsS0FBSyxFQUN2QixvQkFBb0IsQ0FBQyxHQUNyQixRQUFRLGlCQUFpQixPQUFPLFVBQVUsQ0FBQyxPQUN6QyxDQUFDLGFBQWEsT0FBTyxVQUFVLENBQUMsT0FBTyxNQUFNLEdBQUc7SUFFcEQsSUFBSSxNQUFjO0lBQ2xCLElBQUksZ0JBQWdCO1FBQ2xCLHlCQUF5QjtRQUN6QixnRUFBZ0U7UUFDaEUsSUFBSyxJQUFJLEdBQUcsSUFBSSxPQUFPLE1BQU0sRUFBRSxJQUFLO1lBQ2xDLE9BQU8sT0FBTyxVQUFVLENBQUM7WUFDekIsSUFBSSxDQUFDLFlBQVksT0FBTztnQkFDdEIsT0FBTztZQUNULENBQUM7WUFDRCxRQUFRLFNBQVMsWUFBWTtRQUMvQjtJQUNGLE9BQU87UUFDTCxnQ0FBZ0M7UUFDaEMsSUFBSyxJQUFJLEdBQUcsSUFBSSxPQUFPLE1BQU0sRUFBRSxJQUFLO1lBQ2xDLE9BQU8sT0FBTyxVQUFVLENBQUM7WUFDekIsSUFBSSxTQUFTLGdCQUFnQjtnQkFDM0IsZUFBZSxJQUFJO2dCQUNuQixtQ0FBbUM7Z0JBQ25DLElBQUksa0JBQWtCO29CQUNwQixrQkFBa0IsbUJBQ2hCLG1EQUFtRDtvQkFDbEQsSUFBSSxvQkFBb0IsSUFBSSxhQUMzQixNQUFNLENBQUMsb0JBQW9CLEVBQUUsS0FBSztvQkFDdEMsb0JBQW9CO2dCQUN0QixDQUFDO1lBQ0gsT0FBTyxJQUFJLENBQUMsWUFBWSxPQUFPO2dCQUM3QixPQUFPO1lBQ1QsQ0FBQztZQUNELFFBQVEsU0FBUyxZQUFZO1FBQy9CO1FBQ0Esa0NBQWtDO1FBQ2xDLGtCQUFrQixtQkFDZixvQkFDQyxJQUFJLG9CQUFvQixJQUFJLGFBQzVCLE1BQU0sQ0FBQyxvQkFBb0IsRUFBRSxLQUFLO0lBQ3hDLENBQUM7SUFDRCw4RUFBOEU7SUFDOUUsNkVBQTZFO0lBQzdFLHlDQUF5QztJQUN6QyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsaUJBQWlCO1FBQ3JDLDJEQUEyRDtRQUMzRCwrQ0FBK0M7UUFDL0MsT0FBTyxTQUFTLENBQUMsa0JBQWtCLFVBQVUsY0FBYyxZQUFZO0lBQ3pFLENBQUM7SUFDRCxrRUFBa0U7SUFDbEUsSUFBSSxpQkFBaUIsS0FBSyxvQkFBb0IsU0FBUztRQUNyRCxPQUFPO0lBQ1QsQ0FBQztJQUNELGdEQUFnRDtJQUNoRCwrQ0FBK0M7SUFDL0MsT0FBTyxrQkFBa0IsZUFBZSxhQUFhO0FBQ3ZEO0FBRUEsd0JBQXdCO0FBQ3hCLG9EQUFvRDtBQUNwRCwwREFBMEQ7QUFDMUQsNkVBQTZFO0FBQzdFLFNBQVMsU0FBUyxJQUFZLEVBQUUsS0FBYSxFQUFVO0lBQ3JELElBQUksU0FBUyxNQUFNLElBQUksQ0FBQyxFQUFFLEtBQUssS0FBSyxPQUFPO0lBRTNDLDZFQUE2RTtJQUM3RSxNQUFNLFVBQVUsVUFBVSxvREFBb0Q7SUFDOUUsSUFBSTtJQUNKLGtFQUFrRTtJQUNsRSxJQUFJLFFBQVEsR0FDVixLQUNBLE9BQU8sR0FDUCxPQUFPO0lBQ1QsSUFBSSxTQUFTO0lBRWIsc0NBQXNDO0lBQ3RDLGtFQUFrRTtJQUNsRSxtQkFBbUI7SUFDbkIsbUVBQW1FO0lBQ25FLHFEQUFxRDtJQUNyRCxNQUFRLFFBQVEsUUFBUSxJQUFJLENBQUMsTUFBUTtRQUNuQyxPQUFPLE1BQU0sS0FBSztRQUNsQiw0Q0FBNEM7UUFDNUMsSUFBSSxPQUFPLFFBQVEsT0FBTztZQUN4QixNQUFNLE9BQU8sUUFBUSxPQUFPLElBQUksRUFBRSx5QkFBeUI7WUFDM0QsVUFBVSxDQUFDLEVBQUUsRUFBRSxLQUFLLEtBQUssQ0FBQyxPQUFPLEtBQUssQ0FBQztZQUN2Qyx1Q0FBdUM7WUFDdkMsUUFBUSxNQUFNLEdBQUcsMkJBQTJCO1FBQzlDLENBQUM7UUFDRCxPQUFPO0lBQ1Q7SUFFQSx5RUFBeUU7SUFDekUsd0VBQXdFO0lBQ3hFLFVBQVU7SUFDViw4RUFBOEU7SUFDOUUsSUFBSSxLQUFLLE1BQU0sR0FBRyxRQUFRLFNBQVMsT0FBTyxPQUFPO1FBQy9DLFVBQVUsQ0FBQyxFQUFFLEtBQUssS0FBSyxDQUFDLE9BQU8sTUFBTSxFQUFFLEVBQUUsS0FBSyxLQUFLLENBQUMsT0FBTyxHQUFHLENBQUM7SUFDakUsT0FBTztRQUNMLFVBQVUsS0FBSyxLQUFLLENBQUM7SUFDdkIsQ0FBQztJQUVELE9BQU8sT0FBTyxLQUFLLENBQUMsSUFBSSx1QkFBdUI7QUFDakQ7QUFFQSxrQ0FBa0M7QUFDbEMsU0FBUyxrQkFBa0IsTUFBYyxFQUFVO0lBQ2pELE9BQU8sTUFBTSxDQUFDLE9BQU8sTUFBTSxHQUFHLEVBQUUsS0FBSyxPQUFPLE9BQU8sS0FBSyxDQUFDLEdBQUcsQ0FBQyxLQUFLLE1BQU07QUFDMUU7QUFFQSxnRkFBZ0Y7QUFDaEYsNEVBQTRFO0FBQzVFLFNBQVMsV0FBVyxNQUFjLEVBQUUsS0FBYSxFQUFVO0lBQ3pELHNFQUFzRTtJQUN0RSxzRUFBc0U7SUFDdEUsbURBQW1EO0lBQ25ELHdFQUF3RTtJQUN4RSxNQUFNLFNBQVM7SUFFZixzQ0FBc0M7SUFDdEMsSUFBSSxTQUFTLENBQUMsSUFBYztRQUMxQixJQUFJLFNBQVMsT0FBTyxPQUFPLENBQUM7UUFDNUIsU0FBUyxXQUFXLENBQUMsSUFBSSxTQUFTLE9BQU8sTUFBTTtRQUMvQyxPQUFPLFNBQVMsR0FBRztRQUNuQixPQUFPLFNBQVMsT0FBTyxLQUFLLENBQUMsR0FBRyxTQUFTO0lBQzNDLENBQUM7SUFDRCwyRUFBMkU7SUFDM0UsSUFBSSxtQkFBbUIsTUFBTSxDQUFDLEVBQUUsS0FBSyxRQUFRLE1BQU0sQ0FBQyxFQUFFLEtBQUs7SUFDM0QsSUFBSTtJQUVKLG9CQUFvQjtJQUNwQixJQUFJO0lBQ0oscURBQXFEO0lBQ3JELE1BQVEsUUFBUSxPQUFPLElBQUksQ0FBQyxRQUFVO1FBQ3BDLE1BQU0sU0FBUyxLQUFLLENBQUMsRUFBRSxFQUNyQixPQUFPLEtBQUssQ0FBQyxFQUFFO1FBQ2pCLGVBQWUsSUFBSSxDQUFDLEVBQUUsS0FBSztRQUMzQixVQUFVLFNBQ1IsQ0FBQyxDQUFDLG9CQUFvQixDQUFDLGdCQUFnQixTQUFTLEtBQUssT0FBTyxFQUFFLElBQzlELFNBQVMsTUFBTTtRQUNqQixtQkFBbUI7SUFDckI7SUFFQSxPQUFPO0FBQ1Q7QUFFQSxrQ0FBa0M7QUFDbEMsU0FBUyxhQUFhLE1BQWMsRUFBVTtJQUM1QyxJQUFJLFNBQVM7SUFDYixJQUFJLE1BQU07SUFDVixJQUFJO0lBRUosSUFBSyxJQUFJLElBQUksR0FBRyxJQUFJLE9BQU8sTUFBTSxFQUFFLElBQUs7UUFDdEMsT0FBTyxPQUFPLFVBQVUsQ0FBQztRQUN6Qiw4RUFBOEU7UUFDOUUsSUFBSSxRQUFRLFVBQVUsUUFBUSxPQUFPLGtCQUFrQixLQUFJO1lBQ3pELFdBQVcsT0FBTyxVQUFVLENBQUMsSUFBSTtZQUNqQyxJQUFJLFlBQVksVUFBVSxZQUFZLE9BQU8saUJBQWlCLEtBQUk7Z0JBQ2hFLG1EQUFtRDtnQkFDbkQsVUFBVSxVQUNSLENBQUMsT0FBTyxNQUFNLElBQUksUUFBUSxXQUFXLFNBQVM7Z0JBRWhELGdFQUFnRTtnQkFDaEU7Z0JBQ0EsUUFBUztZQUNYLENBQUM7UUFDSCxDQUFDO1FBQ0QsWUFBWSxnQkFBZ0IsQ0FBQyxLQUFLO1FBQ2xDLFVBQVUsQ0FBQyxhQUFhLFlBQVksUUFDaEMsTUFBTSxDQUFDLEVBQUUsR0FDVCxhQUFhLFVBQVUsS0FBSztJQUNsQztJQUVBLE9BQU87QUFDVDtBQUVBLGdGQUFnRjtBQUNoRixTQUFTLFlBQVksTUFBYyxFQUFFLGNBQXNCLEVBQVU7SUFDbkUsTUFBTSxrQkFBa0Isb0JBQW9CLFVBQ3hDLE9BQU8sa0JBQ1AsRUFBRTtJQUVOLDRFQUE0RTtJQUM1RSxNQUFNLE9BQU8sTUFBTSxDQUFDLE9BQU8sTUFBTSxHQUFHLEVBQUUsS0FBSztJQUMzQyxNQUFNLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxPQUFPLE1BQU0sR0FBRyxFQUFFLEtBQUssUUFBUSxXQUFXLElBQUk7SUFDM0UsTUFBTSxRQUFRLE9BQU8sTUFBTSxPQUFPLEtBQUssR0FBRztJQUUxQyxPQUFPLENBQUMsRUFBRSxnQkFBZ0IsRUFBRSxNQUFNLEVBQUUsQ0FBQztBQUN2QztBQUVBLHdFQUF3RTtBQUN4RSw0RUFBNEU7QUFDNUUsNkRBQTZEO0FBQzdELDBFQUEwRTtBQUMxRSxtREFBbUQ7QUFDbkQsK0VBQStFO0FBQy9FLFNBQVMsWUFDUCxLQUFrQixFQUNsQixNQUFjLEVBQ2QsS0FBYSxFQUNiLEtBQWMsRUFDZDtJQUNBLE1BQU0sSUFBSSxHQUFHLENBQUMsSUFBYztRQUMxQixJQUFJLE9BQU8sTUFBTSxLQUFLLEdBQUc7WUFDdkIsT0FBTztRQUNULENBQUM7UUFDRCxJQUNFLENBQUMsTUFBTSxZQUFZLElBQ25CLDJCQUEyQixPQUFPLENBQUMsWUFBWSxDQUFDLEdBQ2hEO1lBQ0EsT0FBTyxDQUFDLENBQUMsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN0QixDQUFDO1FBRUQsTUFBTSxTQUFTLE1BQU0sTUFBTSxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsUUFBUSxzQkFBc0I7UUFDeEUsbUVBQW1FO1FBQ25FLCtDQUErQztRQUMvQyx5QkFBeUI7UUFDekIsMkVBQTJFO1FBQzNFLHdFQUF3RTtRQUN4RSxVQUFVO1FBQ1Ysb0VBQW9FO1FBQ3BFLGtFQUFrRTtRQUNsRSx3QkFBd0I7UUFDeEIsTUFBTSxZQUFZLE1BQU0sU0FBUyxLQUFLLENBQUMsSUFDbkMsQ0FBQyxJQUNELEtBQUssR0FBRyxDQUFDLEtBQUssR0FBRyxDQUFDLE1BQU0sU0FBUyxFQUFFLEtBQUssTUFBTSxTQUFTLEdBQUcsT0FBTztRQUVyRSxpREFBaUQ7UUFDakQsOEJBQThCO1FBQzlCLE1BQU0saUJBQWlCLFNBQ3JCLGdDQUFnQztRQUMvQixNQUFNLFNBQVMsR0FBRyxDQUFDLEtBQUssU0FBUyxNQUFNLFNBQVM7UUFDbkQsU0FBUyxjQUFjLEdBQVcsRUFBVztZQUMzQyxPQUFPLHNCQUFzQixPQUFPO1FBQ3RDO1FBRUEsT0FDRSxrQkFDRSxRQUNBLGdCQUNBLE1BQU0sTUFBTSxFQUNaLFdBQ0E7WUFHRixLQUFLO2dCQUNILE9BQU87WUFDVCxLQUFLO2dCQUNILE9BQU8sQ0FBQyxDQUFDLEVBQUUsT0FBTyxPQUFPLENBQUMsTUFBTSxNQUFNLENBQUMsQ0FBQztZQUMxQyxLQUFLO2dCQUNILE9BQU8sQ0FBQyxDQUFDLEVBQUUsWUFBWSxRQUFRLE1BQU0sTUFBTSxFQUFFLEVBQzNDLGtCQUNFLGFBQWEsUUFBUSxTQUV4QixDQUFDO1lBQ0osS0FBSztnQkFDSCxPQUFPLENBQUMsQ0FBQyxFQUFFLFlBQVksUUFBUSxNQUFNLE1BQU0sRUFBRSxFQUMzQyxrQkFDRSxhQUFhLFdBQVcsUUFBUSxZQUFZLFNBRS9DLENBQUM7WUFDSixLQUFLO2dCQUNILE9BQU8sQ0FBQyxDQUFDLEVBQUUsYUFBYSxRQUFRLENBQUMsQ0FBQztZQUNwQztnQkFDRSxNQUFNLElBQUksVUFBVSwwQ0FBMEM7UUFDbEU7SUFDRixDQUFDO0FBQ0g7QUFFQSxTQUFTLGtCQUNQLEtBQWtCLEVBQ2xCLEtBQWEsRUFDYixNQUFXLEVBQ1g7SUFDQSxJQUFJLFVBQVU7SUFDZCxNQUFNLE9BQU8sTUFBTSxHQUFHO0lBRXRCLElBQUssSUFBSSxRQUFRLEdBQUcsU0FBUyxPQUFPLE1BQU0sRUFBRSxRQUFRLFFBQVEsU0FBUyxFQUFHO1FBQ3RFLDZCQUE2QjtRQUM3QixJQUFJLFVBQVUsT0FBTyxPQUFPLE1BQU0sQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLEtBQUssR0FBRztZQUN4RCxJQUFJLFVBQVUsR0FBRyxXQUFXLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxZQUFZLEdBQUcsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUNoRSxXQUFXLE1BQU0sSUFBSTtRQUN2QixDQUFDO0lBQ0g7SUFFQSxNQUFNLEdBQUcsR0FBRztJQUNaLE1BQU0sSUFBSSxHQUFHLENBQUMsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0FBQzdCO0FBRUEsU0FBUyxtQkFDUCxLQUFrQixFQUNsQixLQUFhLEVBQ2IsTUFBVyxFQUNYLFVBQVUsS0FBSyxFQUNmO0lBQ0EsSUFBSSxVQUFVO0lBQ2QsTUFBTSxPQUFPLE1BQU0sR0FBRztJQUV0QixJQUFLLElBQUksUUFBUSxHQUFHLFNBQVMsT0FBTyxNQUFNLEVBQUUsUUFBUSxRQUFRLFNBQVMsRUFBRztRQUN0RSw2QkFBNkI7UUFDN0IsSUFBSSxVQUFVLE9BQU8sUUFBUSxHQUFHLE1BQU0sQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLElBQUksR0FBRztZQUMxRCxJQUFJLENBQUMsV0FBVyxVQUFVLEdBQUc7Z0JBQzNCLFdBQVcsaUJBQWlCLE9BQU87WUFDckMsQ0FBQztZQUVELElBQUksTUFBTSxJQUFJLElBQUksbUJBQW1CLE1BQU0sSUFBSSxDQUFDLFVBQVUsQ0FBQyxJQUFJO2dCQUM3RCxXQUFXO1lBQ2IsT0FBTztnQkFDTCxXQUFXO1lBQ2IsQ0FBQztZQUVELFdBQVcsTUFBTSxJQUFJO1FBQ3ZCLENBQUM7SUFDSDtJQUVBLE1BQU0sR0FBRyxHQUFHO0lBQ1osTUFBTSxJQUFJLEdBQUcsV0FBVyxNQUFNLHFDQUFxQztBQUNyRTtBQUVBLFNBQVMsaUJBQ1AsS0FBa0IsRUFDbEIsS0FBYSxFQUNiLE1BQVcsRUFDWDtJQUNBLElBQUksVUFBVTtJQUNkLE1BQU0sT0FBTyxNQUFNLEdBQUcsRUFDcEIsZ0JBQWdCLE9BQU8sSUFBSSxDQUFDO0lBRTlCLElBQUksWUFBb0IsV0FBbUI7SUFDM0MsSUFDRSxJQUFJLFFBQVEsR0FBRyxTQUFTLGNBQWMsTUFBTSxFQUM1QyxRQUFRLFFBQ1IsU0FBUyxFQUNUO1FBQ0EsYUFBYSxNQUFNLFlBQVksR0FBRyxNQUFNLEVBQUU7UUFFMUMsSUFBSSxVQUFVLEdBQUcsY0FBYztRQUUvQixZQUFZLGFBQWEsQ0FBQyxNQUFNO1FBQ2hDLGNBQWMsTUFBTSxDQUFDLFVBQVU7UUFFL0IsSUFBSSxDQUFDLFVBQVUsT0FBTyxPQUFPLFdBQVcsS0FBSyxFQUFFLEtBQUssR0FBRztZQUNyRCxRQUFTLEVBQUMseUNBQXlDO1FBQ3JELENBQUM7UUFFRCxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLGNBQWM7UUFFNUMsY0FBYyxDQUFDLEVBQUUsTUFBTSxJQUFJLENBQUMsRUFBRSxNQUFNLFlBQVksR0FBRyxNQUFNLEVBQUUsQ0FBQyxDQUFDLEVBQzNELE1BQU0sWUFBWSxHQUFHLEtBQUssR0FBRyxDQUM5QixDQUFDO1FBRUYsSUFBSSxDQUFDLFVBQVUsT0FBTyxPQUFPLGFBQWEsS0FBSyxFQUFFLEtBQUssR0FBRztZQUN2RCxRQUFTLEVBQUMsMkNBQTJDO1FBQ3ZELENBQUM7UUFFRCxjQUFjLE1BQU0sSUFBSTtRQUV4QixnQ0FBZ0M7UUFDaEMsV0FBVztJQUNiO0lBRUEsTUFBTSxHQUFHLEdBQUc7SUFDWixNQUFNLElBQUksR0FBRyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQztBQUM3QjtBQUVBLFNBQVMsa0JBQ1AsS0FBa0IsRUFDbEIsS0FBYSxFQUNiLE1BQVcsRUFDWCxVQUFVLEtBQUssRUFDZjtJQUNBLE1BQU0sT0FBTyxNQUFNLEdBQUcsRUFDcEIsZ0JBQWdCLE9BQU8sSUFBSSxDQUFDO0lBQzlCLElBQUksVUFBVTtJQUVkLDhEQUE4RDtJQUM5RCxJQUFJLE1BQU0sUUFBUSxLQUFLLElBQUksRUFBRTtRQUMzQixrQkFBa0I7UUFDbEIsY0FBYyxJQUFJO0lBQ3BCLE9BQU8sSUFBSSxPQUFPLE1BQU0sUUFBUSxLQUFLLFlBQVk7UUFDL0MsdUJBQXVCO1FBQ3ZCLGNBQWMsSUFBSSxDQUFDLE1BQU0sUUFBUTtJQUNuQyxPQUFPLElBQUksTUFBTSxRQUFRLEVBQUU7UUFDekIscUJBQXFCO1FBQ3JCLE1BQU0sSUFBSSxVQUFVLDRDQUE0QztJQUNsRSxDQUFDO0lBRUQsSUFBSSxhQUFhLElBQ2YsV0FDQSxhQUNBO0lBQ0YsSUFDRSxJQUFJLFFBQVEsR0FBRyxTQUFTLGNBQWMsTUFBTSxFQUM1QyxRQUFRLFFBQ1IsU0FBUyxFQUNUO1FBQ0EsYUFBYTtRQUViLElBQUksQ0FBQyxXQUFXLFVBQVUsR0FBRztZQUMzQixjQUFjLGlCQUFpQixPQUFPO1FBQ3hDLENBQUM7UUFFRCxZQUFZLGFBQWEsQ0FBQyxNQUFNO1FBQ2hDLGNBQWMsTUFBTSxDQUFDLFVBQVU7UUFFL0IsSUFBSSxDQUFDLFVBQVUsT0FBTyxRQUFRLEdBQUcsV0FBVyxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksR0FBRztZQUM3RCxRQUFTLEVBQUMseUNBQXlDO1FBQ3JELENBQUM7UUFFRCxlQUFlLEFBQUMsTUFBTSxHQUFHLEtBQUssSUFBSSxJQUFJLE1BQU0sR0FBRyxLQUFLLE9BQ2pELE1BQU0sSUFBSSxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sR0FBRztRQUVyQyxJQUFJLGNBQWM7WUFDaEIsSUFBSSxNQUFNLElBQUksSUFBSSxtQkFBbUIsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUk7Z0JBQzdELGNBQWM7WUFDaEIsT0FBTztnQkFDTCxjQUFjO1lBQ2hCLENBQUM7UUFDSCxDQUFDO1FBRUQsY0FBYyxNQUFNLElBQUk7UUFFeEIsSUFBSSxjQUFjO1lBQ2hCLGNBQWMsaUJBQWlCLE9BQU87UUFDeEMsQ0FBQztRQUVELElBQUksQ0FBQyxVQUFVLE9BQU8sUUFBUSxHQUFHLGFBQWEsSUFBSSxFQUFFLGVBQWU7WUFDakUsUUFBUyxFQUFDLDJDQUEyQztRQUN2RCxDQUFDO1FBRUQsSUFBSSxNQUFNLElBQUksSUFBSSxtQkFBbUIsTUFBTSxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUk7WUFDN0QsY0FBYztRQUNoQixPQUFPO1lBQ0wsY0FBYztRQUNoQixDQUFDO1FBRUQsY0FBYyxNQUFNLElBQUk7UUFFeEIsZ0NBQWdDO1FBQ2hDLFdBQVc7SUFDYjtJQUVBLE1BQU0sR0FBRyxHQUFHO0lBQ1osTUFBTSxJQUFJLEdBQUcsV0FBVyxNQUFNLG1DQUFtQztBQUNuRTtBQUVBLFNBQVMsV0FDUCxLQUFrQixFQUNsQixNQUFXLEVBQ1gsV0FBVyxLQUFLLEVBQ1A7SUFDVCxNQUFNLFdBQVcsV0FBVyxNQUFNLGFBQWEsR0FBRyxNQUFNLGFBQWE7SUFFckUsSUFBSTtJQUNKLElBQUk7SUFDSixJQUFJO0lBQ0osSUFBSyxJQUFJLFFBQVEsR0FBRyxTQUFTLFNBQVMsTUFBTSxFQUFFLFFBQVEsUUFBUSxTQUFTLEVBQUc7UUFDeEUsT0FBTyxRQUFRLENBQUMsTUFBTTtRQUV0QixJQUNFLENBQUMsS0FBSyxVQUFVLElBQUksS0FBSyxTQUFTLEtBQ2xDLENBQUMsQ0FBQyxLQUFLLFVBQVUsSUFDZCxPQUFPLFdBQVcsWUFBWSxrQkFBa0IsS0FBSyxVQUFVLEFBQUMsS0FDbkUsQ0FBQyxDQUFDLEtBQUssU0FBUyxJQUFJLEtBQUssU0FBUyxDQUFDLE9BQU8sR0FDMUM7WUFDQSxNQUFNLEdBQUcsR0FBRyxXQUFXLEtBQUssR0FBRyxHQUFHLEdBQUc7WUFFckMsSUFBSSxLQUFLLFNBQVMsRUFBRTtnQkFDbEIsUUFBUSxNQUFNLFFBQVEsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxJQUFJLEtBQUssWUFBWTtnQkFFckQsSUFBSSxVQUFVLElBQUksQ0FBQyxLQUFLLFNBQVMsTUFBTSxxQkFBcUI7b0JBQzFELFVBQVUsQUFBQyxLQUFLLFNBQVMsQ0FBaUIsUUFBUTtnQkFDcEQsT0FBTyxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUUsUUFBUTtvQkFDeEMsVUFBVSxBQUFDLEtBQUssU0FBUyxBQUE2QixDQUFDLE1BQU0sQ0FDM0QsUUFDQTtnQkFFSixPQUFPO29CQUNMLE1BQU0sSUFBSSxVQUNSLENBQUMsRUFBRSxFQUFFLEtBQUssR0FBRyxDQUFDLDRCQUE0QixFQUFFLE1BQU0sT0FBTyxDQUFDLEVBQzFEO2dCQUNKLENBQUM7Z0JBRUQsTUFBTSxJQUFJLEdBQUc7WUFDZixDQUFDO1lBRUQsT0FBTyxJQUFJO1FBQ2IsQ0FBQztJQUNIO0lBRUEsT0FBTyxLQUFLO0FBQ2Q7QUFFQSx3REFBd0Q7QUFDeEQsdURBQXVEO0FBQ3ZELEVBQUU7QUFDRixTQUFTLFVBQ1AsS0FBa0IsRUFDbEIsS0FBYSxFQUNiLE1BQVcsRUFDWCxLQUFjLEVBQ2QsT0FBZ0IsRUFDaEIsUUFBUSxLQUFLLEVBQ0o7SUFDVCxNQUFNLEdBQUcsR0FBRyxJQUFJO0lBQ2hCLE1BQU0sSUFBSSxHQUFHO0lBRWIsSUFBSSxDQUFDLFdBQVcsT0FBTyxRQUFRLEtBQUssR0FBRztRQUNyQyxXQUFXLE9BQU8sUUFBUSxJQUFJO0lBQ2hDLENBQUM7SUFFRCxNQUFNLE9BQU8sVUFBVSxJQUFJLENBQUMsTUFBTSxJQUFJO0lBRXRDLElBQUksT0FBTztRQUNULFFBQVEsTUFBTSxTQUFTLEdBQUcsS0FBSyxNQUFNLFNBQVMsR0FBRztJQUNuRCxDQUFDO0lBRUQsTUFBTSxnQkFBZ0IsU0FBUyxxQkFBcUIsU0FBUztJQUU3RCxJQUFJLGlCQUFpQixDQUFDO0lBQ3RCLElBQUksWUFBWSxLQUFLO0lBQ3JCLElBQUksZUFBZTtRQUNqQixpQkFBaUIsTUFBTSxVQUFVLENBQUMsT0FBTyxDQUFDO1FBQzFDLFlBQVksbUJBQW1CLENBQUM7SUFDbEMsQ0FBQztJQUVELElBQ0UsQUFBQyxNQUFNLEdBQUcsS0FBSyxJQUFJLElBQUksTUFBTSxHQUFHLEtBQUssT0FDckMsYUFDQyxNQUFNLE1BQU0sS0FBSyxLQUFLLFFBQVEsR0FDL0I7UUFDQSxVQUFVLEtBQUs7SUFDakIsQ0FBQztJQUVELElBQUksYUFBYSxNQUFNLGNBQWMsQ0FBQyxlQUFlLEVBQUU7UUFDckQsTUFBTSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDO0lBQ3ZDLE9BQU87UUFDTCxJQUFJLGlCQUFpQixhQUFhLENBQUMsTUFBTSxjQUFjLENBQUMsZUFBZSxFQUFFO1lBQ3ZFLE1BQU0sY0FBYyxDQUFDLGVBQWUsR0FBRyxJQUFJO1FBQzdDLENBQUM7UUFDRCxJQUFJLFNBQVMsbUJBQW1CO1lBQzlCLElBQUksU0FBUyxPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksRUFBRSxNQUFNLEtBQUssR0FBRztnQkFDakQsa0JBQWtCLE9BQU8sT0FBTyxNQUFNLElBQUksRUFBRTtnQkFDNUMsSUFBSSxXQUFXO29CQUNiLE1BQU0sSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLGVBQWUsRUFBRSxNQUFNLElBQUksQ0FBQyxDQUFDO2dCQUNwRCxDQUFDO1lBQ0gsT0FBTztnQkFDTCxpQkFBaUIsT0FBTyxPQUFPLE1BQU0sSUFBSTtnQkFDekMsSUFBSSxXQUFXO29CQUNiLE1BQU0sSUFBSSxHQUFHLENBQUMsS0FBSyxFQUFFLGVBQWUsQ0FBQyxFQUFFLE1BQU0sSUFBSSxDQUFDLENBQUM7Z0JBQ3JELENBQUM7WUFDSCxDQUFDO1FBQ0gsT0FBTyxJQUFJLFNBQVMsa0JBQWtCO1lBQ3BDLE1BQU0sYUFBYSxNQUFNLGFBQWEsSUFBSSxRQUFRLElBQUksUUFBUSxJQUFJLEtBQUs7WUFDdkUsSUFBSSxTQUFTLE1BQU0sSUFBSSxDQUFDLE1BQU0sS0FBSyxHQUFHO2dCQUNwQyxtQkFBbUIsT0FBTyxZQUFZLE1BQU0sSUFBSSxFQUFFO2dCQUNsRCxJQUFJLFdBQVc7b0JBQ2IsTUFBTSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsZUFBZSxFQUFFLE1BQU0sSUFBSSxDQUFDLENBQUM7Z0JBQ3BELENBQUM7WUFDSCxPQUFPO2dCQUNMLGtCQUFrQixPQUFPLFlBQVksTUFBTSxJQUFJO2dCQUMvQyxJQUFJLFdBQVc7b0JBQ2IsTUFBTSxJQUFJLEdBQUcsQ0FBQyxLQUFLLEVBQUUsZUFBZSxDQUFDLEVBQUUsTUFBTSxJQUFJLENBQUMsQ0FBQztnQkFDckQsQ0FBQztZQUNILENBQUM7UUFDSCxPQUFPLElBQUksU0FBUyxtQkFBbUI7WUFDckMsSUFBSSxNQUFNLEdBQUcsS0FBSyxLQUFLO2dCQUNyQixZQUFZLE9BQU8sTUFBTSxJQUFJLEVBQUUsT0FBTztZQUN4QyxDQUFDO1FBQ0gsT0FBTztZQUNMLElBQUksTUFBTSxXQUFXLEVBQUUsT0FBTyxLQUFLO1lBQ25DLE1BQU0sSUFBSSxVQUFVLENBQUMsdUNBQXVDLEVBQUUsS0FBSyxDQUFDLEVBQUU7UUFDeEUsQ0FBQztRQUVELElBQUksTUFBTSxHQUFHLEtBQUssSUFBSSxJQUFJLE1BQU0sR0FBRyxLQUFLLEtBQUs7WUFDM0MsTUFBTSxJQUFJLEdBQUcsQ0FBQyxFQUFFLEVBQUUsTUFBTSxHQUFHLENBQUMsRUFBRSxFQUFFLE1BQU0sSUFBSSxDQUFDLENBQUM7UUFDOUMsQ0FBQztJQUNILENBQUM7SUFFRCxPQUFPLElBQUk7QUFDYjtBQUVBLFNBQVMsWUFDUCxNQUFXLEVBQ1gsT0FBYyxFQUNkLGlCQUEyQixFQUMzQjtJQUNBLElBQUksV0FBVyxJQUFJLElBQUksT0FBTyxXQUFXLFVBQVU7UUFDakQsTUFBTSxRQUFRLFFBQVEsT0FBTyxDQUFDO1FBQzlCLElBQUksVUFBVSxDQUFDLEdBQUc7WUFDaEIsSUFBSSxrQkFBa0IsT0FBTyxDQUFDLFdBQVcsQ0FBQyxHQUFHO2dCQUMzQyxrQkFBa0IsSUFBSSxDQUFDO1lBQ3pCLENBQUM7UUFDSCxPQUFPO1lBQ0wsUUFBUSxJQUFJLENBQUM7WUFFYixJQUFJLE1BQU0sT0FBTyxDQUFDLFNBQVM7Z0JBQ3pCLElBQUssSUFBSSxNQUFNLEdBQUcsU0FBUyxPQUFPLE1BQU0sRUFBRSxNQUFNLFFBQVEsT0FBTyxFQUFHO29CQUNoRSxZQUFZLE1BQU0sQ0FBQyxJQUFJLEVBQUUsU0FBUztnQkFDcEM7WUFDRixPQUFPO2dCQUNMLE1BQU0sZ0JBQWdCLE9BQU8sSUFBSSxDQUFDO2dCQUVsQyxJQUNFLElBQUksTUFBTSxHQUFHLFNBQVMsY0FBYyxNQUFNLEVBQzFDLE1BQU0sUUFDTixPQUFPLEVBQ1A7b0JBQ0EsWUFBWSxNQUFNLENBQUMsYUFBYSxDQUFDLElBQUksQ0FBQyxFQUFFLFNBQVM7Z0JBQ25EO1lBQ0YsQ0FBQztRQUNILENBQUM7SUFDSCxDQUFDO0FBQ0g7QUFFQSxTQUFTLHVCQUNQLE1BQStCLEVBQy9CLEtBQWtCLEVBQ2xCO0lBQ0EsTUFBTSxVQUFpQixFQUFFLEVBQ3ZCLG9CQUE4QixFQUFFO0lBRWxDLFlBQVksUUFBUSxTQUFTO0lBRTdCLE1BQU0sU0FBUyxrQkFBa0IsTUFBTTtJQUN2QyxJQUFLLElBQUksUUFBUSxHQUFHLFFBQVEsUUFBUSxTQUFTLEVBQUc7UUFDOUMsTUFBTSxVQUFVLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUM7SUFDekQ7SUFDQSxNQUFNLGNBQWMsR0FBRyxNQUFNLElBQUksQ0FBQztRQUFFO0lBQU87QUFDN0M7QUFFQSxPQUFPLFNBQVMsS0FBSyxLQUFVLEVBQUUsT0FBNEIsRUFBVTtJQUNyRSxVQUFVLFdBQVcsQ0FBQztJQUV0QixNQUFNLFFBQVEsSUFBSSxZQUFZO0lBRTlCLElBQUksQ0FBQyxNQUFNLE1BQU0sRUFBRSx1QkFBdUIsT0FBTztJQUVqRCxJQUFJLFVBQVUsT0FBTyxHQUFHLE9BQU8sSUFBSSxFQUFFLElBQUksR0FBRyxPQUFPLENBQUMsRUFBRSxNQUFNLElBQUksQ0FBQyxFQUFFLENBQUM7SUFFcEUsT0FBTztBQUNULENBQUMifQ==