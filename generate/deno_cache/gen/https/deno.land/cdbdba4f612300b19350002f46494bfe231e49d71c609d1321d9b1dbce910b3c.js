// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { repeat } from "./utils.ts";
export class Mark {
    constructor(name, buffer, position, line, column){
        this.name = name;
        this.buffer = buffer;
        this.position = position;
        this.line = line;
        this.column = column;
    }
    getSnippet(indent = 4, maxLength = 75) {
        if (!this.buffer) return null;
        let head = "";
        let start = this.position;
        while(start > 0 && "\x00\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(start - 1)) === -1){
            start -= 1;
            if (this.position - start > maxLength / 2 - 1) {
                head = " ... ";
                start += 5;
                break;
            }
        }
        let tail = "";
        let end = this.position;
        while(end < this.buffer.length && "\x00\r\n\x85\u2028\u2029".indexOf(this.buffer.charAt(end)) === -1){
            end += 1;
            if (end - this.position > maxLength / 2 - 1) {
                tail = " ... ";
                end -= 5;
                break;
            }
        }
        const snippet = this.buffer.slice(start, end);
        return `${repeat(" ", indent)}${head}${snippet}${tail}\n${repeat(" ", indent + this.position - start + head.length)}^`;
    }
    toString(compact) {
        let snippet, where = "";
        if (this.name) {
            where += `in "${this.name}" `;
        }
        where += `at line ${this.line + 1}, column ${this.column + 1}`;
        if (!compact) {
            snippet = this.getSnippet();
            if (snippet) {
                where += `:\n${snippet}`;
            }
        }
        return where;
    }
    name;
    buffer;
    position;
    line;
    column;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL21hcmsudHMiXSwic291cmNlc0NvbnRlbnQiOlsiLy8gUG9ydGVkIGZyb20ganMteWFtbCB2My4xMy4xOlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL25vZGVjYS9qcy15YW1sL2NvbW1pdC82NjVhYWRkYTQyMzQ5ZGNhZTg2OWYxMjA0MGQ5YjEwZWYxOGQxMmRhXG4vLyBDb3B5cmlnaHQgMjAxMS0yMDE1IGJ5IFZpdGFseSBQdXpyaW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuLy8gQ29weXJpZ2h0IDIwMTgtMjAyMyB0aGUgRGVubyBhdXRob3JzLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cblxuaW1wb3J0IHsgcmVwZWF0IH0gZnJvbSBcIi4vdXRpbHMudHNcIjtcblxuZXhwb3J0IGNsYXNzIE1hcmsge1xuICBjb25zdHJ1Y3RvcihcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nLFxuICAgIHB1YmxpYyBidWZmZXI6IHN0cmluZyxcbiAgICBwdWJsaWMgcG9zaXRpb246IG51bWJlcixcbiAgICBwdWJsaWMgbGluZTogbnVtYmVyLFxuICAgIHB1YmxpYyBjb2x1bW46IG51bWJlcixcbiAgKSB7fVxuXG4gIHB1YmxpYyBnZXRTbmlwcGV0KGluZGVudCA9IDQsIG1heExlbmd0aCA9IDc1KTogc3RyaW5nIHwgbnVsbCB7XG4gICAgaWYgKCF0aGlzLmJ1ZmZlcikgcmV0dXJuIG51bGw7XG5cbiAgICBsZXQgaGVhZCA9IFwiXCI7XG4gICAgbGV0IHN0YXJ0ID0gdGhpcy5wb3NpdGlvbjtcblxuICAgIHdoaWxlIChcbiAgICAgIHN0YXJ0ID4gMCAmJlxuICAgICAgXCJcXHgwMFxcclxcblxceDg1XFx1MjAyOFxcdTIwMjlcIi5pbmRleE9mKHRoaXMuYnVmZmVyLmNoYXJBdChzdGFydCAtIDEpKSA9PT0gLTFcbiAgICApIHtcbiAgICAgIHN0YXJ0IC09IDE7XG4gICAgICBpZiAodGhpcy5wb3NpdGlvbiAtIHN0YXJ0ID4gbWF4TGVuZ3RoIC8gMiAtIDEpIHtcbiAgICAgICAgaGVhZCA9IFwiIC4uLiBcIjtcbiAgICAgICAgc3RhcnQgKz0gNTtcbiAgICAgICAgYnJlYWs7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHRhaWwgPSBcIlwiO1xuICAgIGxldCBlbmQgPSB0aGlzLnBvc2l0aW9uO1xuXG4gICAgd2hpbGUgKFxuICAgICAgZW5kIDwgdGhpcy5idWZmZXIubGVuZ3RoICYmXG4gICAgICBcIlxceDAwXFxyXFxuXFx4ODVcXHUyMDI4XFx1MjAyOVwiLmluZGV4T2YodGhpcy5idWZmZXIuY2hhckF0KGVuZCkpID09PSAtMVxuICAgICkge1xuICAgICAgZW5kICs9IDE7XG4gICAgICBpZiAoZW5kIC0gdGhpcy5wb3NpdGlvbiA+IG1heExlbmd0aCAvIDIgLSAxKSB7XG4gICAgICAgIHRhaWwgPSBcIiAuLi4gXCI7XG4gICAgICAgIGVuZCAtPSA1O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzbmlwcGV0ID0gdGhpcy5idWZmZXIuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gICAgcmV0dXJuIGAke3JlcGVhdChcIiBcIiwgaW5kZW50KX0ke2hlYWR9JHtzbmlwcGV0fSR7dGFpbH1cXG4ke1xuICAgICAgcmVwZWF0KFxuICAgICAgICBcIiBcIixcbiAgICAgICAgaW5kZW50ICsgdGhpcy5wb3NpdGlvbiAtIHN0YXJ0ICsgaGVhZC5sZW5ndGgsXG4gICAgICApXG4gICAgfV5gO1xuICB9XG5cbiAgcHVibGljIHRvU3RyaW5nKGNvbXBhY3Q/OiBib29sZWFuKTogc3RyaW5nIHtcbiAgICBsZXQgc25pcHBldCxcbiAgICAgIHdoZXJlID0gXCJcIjtcblxuICAgIGlmICh0aGlzLm5hbWUpIHtcbiAgICAgIHdoZXJlICs9IGBpbiBcIiR7dGhpcy5uYW1lfVwiIGA7XG4gICAgfVxuXG4gICAgd2hlcmUgKz0gYGF0IGxpbmUgJHt0aGlzLmxpbmUgKyAxfSwgY29sdW1uICR7dGhpcy5jb2x1bW4gKyAxfWA7XG5cbiAgICBpZiAoIWNvbXBhY3QpIHtcbiAgICAgIHNuaXBwZXQgPSB0aGlzLmdldFNuaXBwZXQoKTtcblxuICAgICAgaWYgKHNuaXBwZXQpIHtcbiAgICAgICAgd2hlcmUgKz0gYDpcXG4ke3NuaXBwZXR9YDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gd2hlcmU7XG4gIH1cbn1cbiJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSwrQkFBK0I7QUFDL0Isb0ZBQW9GO0FBQ3BGLDBFQUEwRTtBQUMxRSwwRUFBMEU7QUFFMUUsU0FBUyxNQUFNLFFBQVEsYUFBYTtBQUVwQyxPQUFPLE1BQU07SUFDWCxZQUNTLE1BQ0EsUUFDQSxVQUNBLE1BQ0EsT0FDUDtvQkFMTztzQkFDQTt3QkFDQTtvQkFDQTtzQkFDQTtJQUNOO0lBRUksV0FBVyxTQUFTLENBQUMsRUFBRSxZQUFZLEVBQUUsRUFBaUI7UUFDM0QsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsT0FBTyxJQUFJO1FBRTdCLElBQUksT0FBTztRQUNYLElBQUksUUFBUSxJQUFJLENBQUMsUUFBUTtRQUV6QixNQUNFLFFBQVEsS0FDUiwyQkFBMkIsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsUUFBUSxDQUFDLEVBQ3ZFO1lBQ0EsU0FBUztZQUNULElBQUksSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLFlBQVksSUFBSSxHQUFHO2dCQUM3QyxPQUFPO2dCQUNQLFNBQVM7Z0JBQ1QsS0FBTTtZQUNSLENBQUM7UUFDSDtRQUVBLElBQUksT0FBTztRQUNYLElBQUksTUFBTSxJQUFJLENBQUMsUUFBUTtRQUV2QixNQUNFLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLElBQ3hCLDJCQUEyQixPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsVUFBVSxDQUFDLEVBQ2pFO1lBQ0EsT0FBTztZQUNQLElBQUksTUFBTSxJQUFJLENBQUMsUUFBUSxHQUFHLFlBQVksSUFBSSxHQUFHO2dCQUMzQyxPQUFPO2dCQUNQLE9BQU87Z0JBQ1AsS0FBTTtZQUNSLENBQUM7UUFDSDtRQUVBLE1BQU0sVUFBVSxJQUFJLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxPQUFPO1FBQ3pDLE9BQU8sQ0FBQyxFQUFFLE9BQU8sS0FBSyxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxLQUFLLEVBQUUsRUFDdEQsT0FDRSxLQUNBLFNBQVMsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLEtBQUssTUFBTSxFQUUvQyxDQUFDLENBQUM7SUFDTDtJQUVPLFNBQVMsT0FBaUIsRUFBVTtRQUN6QyxJQUFJLFNBQ0YsUUFBUTtRQUVWLElBQUksSUFBSSxDQUFDLElBQUksRUFBRTtZQUNiLFNBQVMsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUM7UUFDL0IsQ0FBQztRQUVELFNBQVMsQ0FBQyxRQUFRLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxHQUFHLEVBQUUsQ0FBQztRQUU5RCxJQUFJLENBQUMsU0FBUztZQUNaLFVBQVUsSUFBSSxDQUFDLFVBQVU7WUFFekIsSUFBSSxTQUFTO2dCQUNYLFNBQVMsQ0FBQyxHQUFHLEVBQUUsUUFBUSxDQUFDO1lBQzFCLENBQUM7UUFDSCxDQUFDO1FBRUQsT0FBTztJQUNUO0lBcEVTO0lBQ0E7SUFDQTtJQUNBO0lBQ0E7QUFpRVgsQ0FBQyJ9