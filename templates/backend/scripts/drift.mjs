import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

const manifest = JSON.parse(await readFile(".template-manifest.json", "utf8"));
const exceptions = JSON.parse(await readFile("doc/decisions/standards-exceptions.json", "utf8"));
const managed = (file) =>
  file === "AGENTS.md" ||
  file === "CLAUDE.md" ||
  [
    ".github/instructions/",
    ".github/skills/",
    ".github/agents/",
    ".claude/",
    ".cursor/",
    "doc/standards/",
  ].some((prefix) => file.startsWith(prefix));
for (const [file, expected] of Object.entries(manifest.files)) {
  if (!managed(file)) continue;
  if (path.isAbsolute(file) || file.split(/[\\/]/u).includes(".."))
    throw new Error("Unsafe manifest path.");
  let actual;
  try {
    actual = createHash("sha256")
      .update(await readFile(file))
      .digest("hex");
  } catch (error) {
    if (error.code !== "ENOENT") throw error;
    actual = "missing";
  }
  if (actual === expected) continue;
  const exception = exceptions.find((item) => item.path === file && item.sha256 === actual);
  if (
    !exception ||
    !exception.approvedBy ||
    !exception.evidence ||
    !/^doc\/decisions\/\d{4}-[\w-]+\.md$/u.test(exception.adr)
  ) {
    throw new Error(
      `Managed standard drift: ${file}. A reviewed, hash-bound ADR exception is required.`,
    );
  }
  const adr = await readFile(exception.adr, "utf8");
  if (!adr.includes("Status: Accepted") || !adr.includes(exception.approvedBy))
    throw new Error(`Invalid exception ADR for ${file}`);
}
console.log(
  "Managed standards match the baseline or documented reviewed exceptions. Git metadata alone is not approval.",
);
