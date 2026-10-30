import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SetupOptions } from "./setup-options.js";
import type { Manifest } from "./manifest.js";
import { fingerprint, listFiles } from "./files.js";

export async function render(
  template: string,
  destination: string,
  options: SetupOptions,
  version: string,
  signal?: AbortSignal,
): Promise<void> {
  const files: Record<string, string> = {};
  for (const relative of await listFiles(template)) {
    signal?.throwIfAborted();
    const output = relative.endsWith(".asset") ? relative.slice(0, -6) : relative;
    const target = path.join(destination, output);
    await mkdir(path.dirname(target), { recursive: true });
    let content = await readFile(path.join(template, relative), "utf8");
    if (output === "package.json" || output === "package-lock.json") {
      const json = JSON.parse(content);
      json.name = options.name;
      if (output === "package.json") json.description = options.description;
      else if (json.packages?.[""]) json.packages[""].name = options.name;
      content = `${JSON.stringify(json, null, 2)}\n`;
    }
    await writeFile(target, content.replaceAll("__PROJECT_NAME__", options.name), { flag: "wx" });
    files[output] = await fingerprint(target);
  }
  await writeFile(
    path.join(destination, "project.setup.json"),
    `${JSON.stringify(options, null, 2)}\n`,
    { flag: "wx" },
  );
  const manifest: Manifest = {
    schemaVersion: 1,
    generatorVersion: version,
    templateVersion: version,
    files,
  };
  await writeFile(
    path.join(destination, ".template-manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    { flag: "wx" },
  );
}
