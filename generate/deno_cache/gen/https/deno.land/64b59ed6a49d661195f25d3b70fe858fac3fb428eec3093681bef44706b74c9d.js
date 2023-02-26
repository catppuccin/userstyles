// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { Schema } from "../schema.ts";
import { binary, merge, omap, pairs, set, timestamp } from "../type/mod.ts";
import { core } from "./core.ts";
// JS-YAML's default schema for `safeLoad` function.
// It is not described in the YAML specification.
export const def = new Schema({
    explicit: [
        binary,
        omap,
        pairs,
        set
    ],
    implicit: [
        timestamp,
        merge
    ],
    include: [
        core
    ]
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL3NjaGVtYS9kZWZhdWx0LnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IFNjaGVtYSB9IGZyb20gXCIuLi9zY2hlbWEudHNcIjtcbmltcG9ydCB7IGJpbmFyeSwgbWVyZ2UsIG9tYXAsIHBhaXJzLCBzZXQsIHRpbWVzdGFtcCB9IGZyb20gXCIuLi90eXBlL21vZC50c1wiO1xuaW1wb3J0IHsgY29yZSB9IGZyb20gXCIuL2NvcmUudHNcIjtcblxuLy8gSlMtWUFNTCdzIGRlZmF1bHQgc2NoZW1hIGZvciBgc2FmZUxvYWRgIGZ1bmN0aW9uLlxuLy8gSXQgaXMgbm90IGRlc2NyaWJlZCBpbiB0aGUgWUFNTCBzcGVjaWZpY2F0aW9uLlxuZXhwb3J0IGNvbnN0IGRlZiA9IG5ldyBTY2hlbWEoe1xuICBleHBsaWNpdDogW2JpbmFyeSwgb21hcCwgcGFpcnMsIHNldF0sXG4gIGltcGxpY2l0OiBbdGltZXN0YW1wLCBtZXJnZV0sXG4gIGluY2x1ZGU6IFtjb3JlXSxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSxTQUFTLE1BQU0sUUFBUSxlQUFlO0FBQ3RDLFNBQVMsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFJLEVBQUUsS0FBSyxFQUFFLEdBQUcsRUFBRSxTQUFTLFFBQVEsaUJBQWlCO0FBQzVFLFNBQVMsSUFBSSxRQUFRLFlBQVk7QUFFakMsb0RBQW9EO0FBQ3BELGlEQUFpRDtBQUNqRCxPQUFPLE1BQU0sTUFBTSxJQUFJLE9BQU87SUFDNUIsVUFBVTtRQUFDO1FBQVE7UUFBTTtRQUFPO0tBQUk7SUFDcEMsVUFBVTtRQUFDO1FBQVc7S0FBTTtJQUM1QixTQUFTO1FBQUM7S0FBSztBQUNqQixHQUFHIn0=