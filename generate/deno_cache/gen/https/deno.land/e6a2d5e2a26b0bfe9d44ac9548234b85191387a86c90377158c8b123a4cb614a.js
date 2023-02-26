// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { Schema } from "../schema.ts";
import { bool, float, int, nil } from "../type/mod.ts";
import { failsafe } from "./failsafe.ts";
// Standard YAML's JSON schema.
// http://www.yaml.org/spec/1.2/spec.html#id2803231
export const json = new Schema({
    implicit: [
        nil,
        bool,
        int,
        float
    ],
    include: [
        failsafe
    ]
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL3NjaGVtYS9qc29uLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8vIFBvcnRlZCBmcm9tIGpzLXlhbWwgdjMuMTMuMTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9ub2RlY2EvanMteWFtbC9jb21taXQvNjY1YWFkZGE0MjM0OWRjYWU4NjlmMTIwNDBkOWIxMGVmMThkMTJkYVxuLy8gQ29weXJpZ2h0IDIwMTEtMjAxNSBieSBWaXRhbHkgUHV6cmluLiBBbGwgcmlnaHRzIHJlc2VydmVkLiBNSVQgbGljZW5zZS5cbi8vIENvcHlyaWdodCAyMDE4LTIwMjMgdGhlIERlbm8gYXV0aG9ycy4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG5cbmltcG9ydCB7IFNjaGVtYSB9IGZyb20gXCIuLi9zY2hlbWEudHNcIjtcbmltcG9ydCB7IGJvb2wsIGZsb2F0LCBpbnQsIG5pbCB9IGZyb20gXCIuLi90eXBlL21vZC50c1wiO1xuaW1wb3J0IHsgZmFpbHNhZmUgfSBmcm9tIFwiLi9mYWlsc2FmZS50c1wiO1xuXG4vLyBTdGFuZGFyZCBZQU1MJ3MgSlNPTiBzY2hlbWEuXG4vLyBodHRwOi8vd3d3LnlhbWwub3JnL3NwZWMvMS4yL3NwZWMuaHRtbCNpZDI4MDMyMzFcbmV4cG9ydCBjb25zdCBqc29uID0gbmV3IFNjaGVtYSh7XG4gIGltcGxpY2l0OiBbbmlsLCBib29sLCBpbnQsIGZsb2F0XSxcbiAgaW5jbHVkZTogW2ZhaWxzYWZlXSxcbn0pO1xuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLCtCQUErQjtBQUMvQixvRkFBb0Y7QUFDcEYsMEVBQTBFO0FBQzFFLDBFQUEwRTtBQUUxRSxTQUFTLE1BQU0sUUFBUSxlQUFlO0FBQ3RDLFNBQVMsSUFBSSxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUUsR0FBRyxRQUFRLGlCQUFpQjtBQUN2RCxTQUFTLFFBQVEsUUFBUSxnQkFBZ0I7QUFFekMsK0JBQStCO0FBQy9CLG1EQUFtRDtBQUNuRCxPQUFPLE1BQU0sT0FBTyxJQUFJLE9BQU87SUFDN0IsVUFBVTtRQUFDO1FBQUs7UUFBTTtRQUFLO0tBQU07SUFDakMsU0FBUztRQUFDO0tBQVM7QUFDckIsR0FBRyJ9