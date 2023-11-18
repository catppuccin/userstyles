import chalk from "chalk";
import core from "@actions/core";

export type LoggerProps = core.AnnotationProperties & {
  content?: string;
};

const pretty_print = (
  message: string,
  props: LoggerProps,
  severity: "error" | "warning" = "warning",
) => {
  const startLine = props.startLine ?? 0;
  const lines = (props.content ?? "").split("\n");

  const error = [
    chalk[severity === "error" ? "red" : "yellow"](severity),
    message,
  ].join(" ");

  const line = lines[startLine - 1].split("").map((char, i) => {
    const startCol = (props.startColumn ?? 0) - 1;
    const endCol = (props.endColumn ?? Infinity) - 1;

    if (i >= startCol && i <= endCol) {
      return chalk[severity === "error" ? "red" : "yellow"](char);
    } else {
      return char;
    }
  }).join("");

  console.log(
    [
      `${props.file}:${chalk.grey(`${props.startLine}:${props.startColumn}`)}`,
      ` ┃${chalk.dim(lines[startLine - 2])}`,
      ` ┃${chalk.grey(line)}`,
      ` ┃${chalk.dim(lines[startLine])}`,
      error,
      undefined,
    ].join("\n"),
  );
};

export const log = (
  message: string,
  props: LoggerProps,
  severity: "error" | "warning" = "warning",
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
    pretty_print(message, props, severity);
  }
};
