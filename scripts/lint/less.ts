import less from "less";

import type { Diagnostic } from "#/utils/diagnostics.ts";
import "#/lint/library.ts";

/**
 * Compile a userstyle with Less.
 */
export async function checkLess(
  file: string,
  content: string,
  globalVars: Record<string, string>,
): Promise<Diagnostic[]> {
  try {
    await less.render(content, { lint: true, globalVars });
    return [];
  } catch (err) {
    const { message, filename, line: rawLine } = err as Less.RenderError;
    // Subtract extra line containing serialized global variables (https://github.com/less/less.js/blob/713331655e437401dfea6cd233893a69762734e1/packages/less/lib/less/parser/parser.js#L301).
    const line = filename === "input" ? rawLine - 1 : rawLine;
    return [{
      file,
      message,
      severity: "error",
      span: { line: { start: line, end: line } },
      content,
    }];
  }
}
