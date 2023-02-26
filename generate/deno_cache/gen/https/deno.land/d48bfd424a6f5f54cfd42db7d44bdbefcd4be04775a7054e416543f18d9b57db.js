// Ported from js-yaml v3.13.1:
// https://github.com/nodeca/js-yaml/commit/665aadda42349dcae869f12040d9b10ef18d12da
// Copyright 2011-2015 by Vitaly Puzrin. All rights reserved. MIT license.
// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { Schema } from "../schema.ts";
import { map, seq, str } from "../type/mod.ts";
// Standard YAML's Failsafe schema.
// http://www.yaml.org/spec/1.2/spec.html#id2802346
export const failsafe = new Schema({
    explicit: [
        str,
        seq,
        map
    ]
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImh0dHBzOi8vZGVuby5sYW5kL3N0ZEAwLjE3Mi4wL2VuY29kaW5nL195YW1sL3NjaGVtYS9mYWlsc2FmZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyIvLyBQb3J0ZWQgZnJvbSBqcy15YW1sIHYzLjEzLjE6XG4vLyBodHRwczovL2dpdGh1Yi5jb20vbm9kZWNhL2pzLXlhbWwvY29tbWl0LzY2NWFhZGRhNDIzNDlkY2FlODY5ZjEyMDQwZDliMTBlZjE4ZDEyZGFcbi8vIENvcHlyaWdodCAyMDExLTIwMTUgYnkgVml0YWx5IFB1enJpbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC4gTUlUIGxpY2Vuc2UuXG4vLyBDb3B5cmlnaHQgMjAxOC0yMDIzIHRoZSBEZW5vIGF1dGhvcnMuIEFsbCByaWdodHMgcmVzZXJ2ZWQuIE1JVCBsaWNlbnNlLlxuXG5pbXBvcnQgeyBTY2hlbWEgfSBmcm9tIFwiLi4vc2NoZW1hLnRzXCI7XG5pbXBvcnQgeyBtYXAsIHNlcSwgc3RyIH0gZnJvbSBcIi4uL3R5cGUvbW9kLnRzXCI7XG5cbi8vIFN0YW5kYXJkIFlBTUwncyBGYWlsc2FmZSBzY2hlbWEuXG4vLyBodHRwOi8vd3d3LnlhbWwub3JnL3NwZWMvMS4yL3NwZWMuaHRtbCNpZDI4MDIzNDZcbmV4cG9ydCBjb25zdCBmYWlsc2FmZSA9IG5ldyBTY2hlbWEoe1xuICBleHBsaWNpdDogW3N0ciwgc2VxLCBtYXBdLFxufSk7XG4iXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsK0JBQStCO0FBQy9CLG9GQUFvRjtBQUNwRiwwRUFBMEU7QUFDMUUsMEVBQTBFO0FBRTFFLFNBQVMsTUFBTSxRQUFRLGVBQWU7QUFDdEMsU0FBUyxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsUUFBUSxpQkFBaUI7QUFFL0MsbUNBQW1DO0FBQ25DLG1EQUFtRDtBQUNuRCxPQUFPLE1BQU0sV0FBVyxJQUFJLE9BQU87SUFDakMsVUFBVTtRQUFDO1FBQUs7UUFBSztLQUFJO0FBQzNCLEdBQUcifQ==