import core from "@actions/core";
import { style } from "#/utils/style.ts";

export type Diagnostic = {
  /** Path relative to the repository root. */
  file: string;
  message: string;
  severity: "error" | "warning";
  /** 1-based, inclusive positions in `content`. */
  span?: {
    line: { start: number; end?: number };
    column?: { start: number; end?: number };
  };
  /** The text that the line and column numbers refer to, used to print context. */
  content?: string;
  /** Whether `pnpm lint:fix` can fix this problem. */
  fixable?: boolean;
};

function printWithContext(diagnostic: Diagnostic) {
  const { file, message, severity, span, fixable } = diagnostic;
  const startLine = span?.line.start;
  const startColumn = span?.column?.start;

  const lines = (diagnostic.content ?? "").split("\n");

  const error = [
    style[severity === "error" ? "red" : "yellow"](severity),
    message,
    ...(fixable ? [style.green("[autofixable]")] : []),
  ].join(" ");

  const pad = startLine ? (startLine + 1).toString().length : 0;

  const logs = [
    style.underline(
      `${file}${startLine ? ":" + startLine : ""}${
        startColumn ? ":" + startColumn : ""
      }`,
    ),
  ];

  if (startLine) {
    const line = lines[startLine - 1].split("").map((char, i) => {
      const startCol = (span?.column?.start ?? 0) - 1;
      const endCol = (span?.column?.end ?? Infinity) - 1;

      if (i >= startCol && i <= endCol) {
        return style[severity === "error" ? "red" : "yellow"](char);
      } else {
        return char;
      }
    }).join("");

    logs.push(...[
      `${style.dim(String(startLine - 1).padStart(pad, " "))}│ ${
        style.dim(lines[startLine - 2] ?? "")
      }`,
      `${style.bold(String(startLine).padStart(pad, " "))}│ ${line}`,
      `${style.dim(String(startLine + 1).padStart(pad, " "))}│ ${
        style.dim(lines[startLine] ?? "")
      }`,
    ]);
  }

  logs.push(`${" ".repeat(pad)}╰─► ${error}`);

  console.log("\n" + logs.join("\n"));
}

/**
 * Report diagnostics either as GitHub Actions annotations in CI or in the terminal with additional context.
 */
export function report(diagnostics: Diagnostic[]) {
  for (const diagnostic of diagnostics) {
    if ("CI" in process.env) {
      const { file, message, severity, span } = diagnostic;
      core[severity](message, {
        file,
        startLine: span?.line.start,
        endLine: span?.line.end,
        startColumn: span?.column?.start,
        endColumn: span?.column?.end,
      });
    } else {
      printWithContext(diagnostic);
    }
  }
}
