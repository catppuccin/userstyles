import { sprintf } from "@std/fmt/printf";
import * as color from "@std/fmt/colors";
import core from "@actions/core";

export type LoggerProps = core.AnnotationProperties & { content?: string };

const prettyPrint = (
  message: string,
  props: LoggerProps,
  severity: "error" | "warning" = "warning",
) => {
  const { file, startColumn, startLine } = props;
  if (!startLine) return console.log(message);

  const lines = (props.content ?? "").split("\n");

  const error = [
    color[severity === "error" ? "red" : "yellow"](severity),
    message,
  ].join(" ");

  const line = lines[startLine - 1].split("").map((char, i) => {
    const startCol = (props.startColumn ?? 0) - 1;
    const endCol = (props.endColumn ?? Infinity) - 1;

    if (i >= startCol && i <= endCol) {
      return color[severity === "error" ? "red" : "yellow"](char);
    } else {
      return char;
    }
  }).join("");

  const pad = startLine.toString().length;
  console.log(
    [
      color.underline(
        sprintf(
          "%s%s%s",
          file,
          startLine ? ":" + startLine : "",
          startColumn ? ":" + startColumn : "",
        ),
      ),
      sprintf(
        "%*s│ %s",
        pad,
        color.dim(String(startLine - 1)),
        color.dim(lines[startLine - 2]),
      ),
      sprintf("%*s│ %s", pad, color.bold(String(startLine)), line),
      sprintf(
        "%*s│ %s",
        pad,
        color.dim(String(startLine + 1)),
        color.dim(lines[startLine]),
      ),
      sprintf(
        "%*s╰─► %s",
        pad,
        "",
        error,
      ),
      undefined,
    ].join("\n"),
  );
};

export const log = {
  log: (
    message: string,
    props: LoggerProps,
    severity: "error" | "warning",
  ) => {
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
