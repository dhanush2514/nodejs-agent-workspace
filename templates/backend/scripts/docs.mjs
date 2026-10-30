import { readdir, readFile, access } from "node:fs/promises";
import path from "node:path";
async function check(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) await check(filename);
    else if (filename.endsWith(".md")) {
      const text = await readFile(filename, "utf8");
      for (const match of text.matchAll(/\[[^\]]*\]\(([^)]+)\)/gu)) {
        const link = match[1].split("#")[0];
        if (!link || /^[a-z]+:/iu.test(link)) continue;
        try {
          await access(path.resolve(path.dirname(filename), decodeURIComponent(link)));
        } catch {
          throw new Error(`Broken documentation link: ${filename} -> ${link}`);
        }
      }
    }
  }
}
await check("doc");
console.log("Local documentation links passed.");
