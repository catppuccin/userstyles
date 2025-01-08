import { getUserstylesFiles } from "@/utils.ts";
import { relative } from "@std/path";
import { REPO_ROOT } from "@/constants.ts";

const METADATA_ENDING_COMMENT = "==/UserStyle== */";

for (const userstyle of getUserstylesFiles()) {
  const content = Deno.readTextFileSync(userstyle);

  const start = content.indexOf(METADATA_ENDING_COMMENT);
  if (start === -1) {
    throw new Error("Userstyle metadata ending comment not found");
  }
  const metadata = content.slice(0, start + METADATA_ENDING_COMMENT.length);

  const oldPath = userstyle.replace(/\.less$/, ".css");
  const relativeOldPath = relative(REPO_ROOT, oldPath);
  const relativeNewPath = relative(REPO_ROOT, userstyle);
  const updateURLPrefix =
    "@updateURL https://github.com/catppuccin/userstyles/raw/main/";

  let newContent = metadata.replace(
    updateURLPrefix + relativeOldPath,
    updateURLPrefix + relativeNewPath,
  );
  const newContentLines = newContent.split("\n");
  const nameVarLine = newContentLines.findIndex((line) =>
    line.startsWith("@name")
  );
  if (nameVarLine === -1) {
    throw new Error("Userstyle name variable not found");
  }
  newContentLines[nameVarLine] += " [STUB | UPDATE REQUIRED]";
  newContent = newContentLines.join("\n");

  Deno.writeTextFileSync(
    userstyle.replace(/\.less$/, ".css"),
    newContent,
  );

  // Bump once for update to stub.
  execBumpTask(relativeOldPath);

  // Bump twice so that version is higher than stub.
  execBumpTask(relativeNewPath);
  execBumpTask(relativeNewPath);
}

async function execBumpTask(file: string) {
  const bumpTask = new Deno.Command(
    Deno.execPath(),
    {
      args: [
        "task",
        "bump",
        file,
      ],
    },
  );

  const output = await bumpTask.output();
  if (output.success === false) {
    throw new Error(new TextDecoder().decode(output.stderr));
  }
}
