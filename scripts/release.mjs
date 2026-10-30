import { mkdir, readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import path from "node:path";

await mkdir("release", { recursive: true });
const npmCli = process.env.npm_execpath;
if (!npmCli) throw new Error("Run through npm run pack:release.");
const result = spawnSync(
  process.execPath,
  [npmCli, "pack", "--json", "--pack-destination", "release"],
  { encoding: "utf8", shell: false },
);
if (result.status !== 0) throw new Error(result.stderr || "npm pack failed");
const [{ filename }] = JSON.parse(result.stdout);
const digest = createHash("sha256")
  .update(await readFile(path.join("release", filename)))
  .digest("hex");
await writeFile(path.join("release", `${filename}.sha256`), `${digest}  ${filename}\n`);
console.log(`Created release/${filename} and checksum. No upload performed.`);
