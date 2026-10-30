import { readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";

export async function listFiles(root: string, prefix = ""): Promise<string[]> {
  const result: string[] = [];
  for (const entry of await readdir(path.join(root, prefix), { withFileTypes: true })) {
    const relative = path.posix.join(prefix, entry.name);
    if (entry.isSymbolicLink()) throw new Error(`Template symlinks are forbidden: ${relative}`);
    if (entry.isDirectory()) result.push(...(await listFiles(root, relative)));
    else if (entry.isFile()) result.push(relative);
  }
  return result.sort();
}

export async function fingerprint(file: string): Promise<string> {
  return createHash("sha256")
    .update(await readFile(file))
    .digest("hex");
}
