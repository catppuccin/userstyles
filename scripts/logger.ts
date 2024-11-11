import { sprintf } from "@std/fmt/printf";
import * as color from "@std/fmt/colors";
import core from "@actions/core";

export type LoggerProps = core.AnnotationProperties & {
  file: string;
  content?: string;
};

function prettyPrint(
  message: string,
  props: LoggerProps,
  severity: "error" | "warning" = "warning",
) {
  const { file, startColumn, startLine } = props;

  const lines = (props.content ?? "").split("\n");

  const error = [
    color[severity === "error" ? "red" : "yellow"](severity),
    message,
  ].join(" ");

  const pad = startLine ? (startLine + 1).toString().length : 0;

  const logs = [color.underline(
    sprintf(
      "%s%s%s",
      file,
      startLine ? ":" + startLine : "",
      startColumn ? ":" + startColumn : "",
    ),
  )];

  if (startLine) {
    const line = lines[startLine - 1].split("").map((char, i) => {
      const startCol = (props.startColumn ?? 0) - 1;
      const endCol = (props.endColumn ?? Infinity) - 1;

      if (i >= startCol && i <= endCol) {
        return color[severity === "error" ? "red" : "yellow"](char);
      } else {
        return char;
      }
    }).join("");

    logs.push(...[
      sprintf(
        "%s│ %s",
        color.dim(String(startLine - 1).padStart(pad, " ")),
        color.dim(lines[startLine - 2]),
      ),
      sprintf(
        "%s│ %s",
        color.bold(String(startLine).padStart(pad, " ")),
        line,
      ),
      sprintf(
        "%s│ %s",
        color.dim(String(startLine + 1).padStart(pad, " ")),
        color.dim(lines[startLine]),
      ),
    ]);
  }

  logs.push(
    sprintf(
      "%*s╰─► %s",
      pad,
      "",
      error,
    ),
  );

  console.log("\n" + logs.join("\n"));
}

export const log = {
  failed: false,

  log: function (
    message: string,
    props: LoggerProps,
    severity: "error" | "warning",
  ) {
    if (severity === "error") this.failed = true;
    if (Deno.env.has("CI")) {
      switch (severity) {
        case "error":
          core.error(message, props);
          break;
        case "warning":
          core.warning(message, props);
          break;
      }
    } else {
      prettyPrint(message, props, severity);
    }
  },

  warn: function (
    message: string,
    props: LoggerProps,
  ) {
    this.log(message, props, "warning");
  },

  error: function (
    message: string,
    props: LoggerProps,
  ) {
    this.log(message, props, "error");
  },
};
