import { mkdtemp, readFile, rm, lstat, mkdir, realpath } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import * as tar from "tar";
import { fingerprint } from "./files.js";
import { render } from "./render.js";
import { validateOptions } from "./validate-options.js";
import type { Manifest } from "./manifest.js";

export async function compare(project: string, archive: string): Promise<string[]> {
  const projectRoot = await realpath(project);
  const temporary = await mkdtemp(path.join(tmpdir(), "backend-compare-"));
  try {
    await tar.x({
      file: archive,
      cwd: temporary,
      strict: true,
      filter: (name, entry) => {
        if (!("type" in entry) || (entry.type !== "File" && entry.type !== "Directory"))
          throw new Error("Archive links/special files are forbidden.");
        if (
          !name.startsWith("package/") ||
          name.includes("..") ||
          name.includes("\\") ||
          path.isAbsolute(name)
        )
          throw new Error("Unsafe archive path.");
        return true;
      },
    });
    const options = validateOptions(
      JSON.parse(await readFile(path.join(project, "project.setup.json"), "utf8")),
    );
    const next = path.join(temporary, "rendered");
    await mkdir(next);
    const metadata = JSON.parse(
      await readFile(path.join(temporary, "package", "package.json"), "utf8"),
    );
    await render(
      path.join(temporary, "package", "bundle"),
      next,
      options,
      String(metadata.version),
    );
    const previous: Manifest = JSON.parse(
      await readFile(path.join(project, ".template-manifest.json"), "utf8"),
    );
    const upcoming: Manifest = JSON.parse(
      await readFile(path.join(next, ".template-manifest.json"), "utf8"),
    );
    const findings: string[] = [];
    for (const file of new Set([...Object.keys(previous.files), ...Object.keys(upcoming.files)])) {
      if (path.isAbsolute(file) || file.split(/[\\/]/u).includes(".."))
        throw new Error("Unsafe manifest path.");
      let actual: string | undefined;
      try {
        if ((await lstat(path.join(project, file))).isSymbolicLink())
          throw new Error("Project symlinks are not supported.");
        const relative = path.relative(projectRoot, await realpath(path.join(project, file)));
        if (relative.startsWith("..") || path.isAbsolute(relative))
          throw new Error("Manifest path escapes project through a link.");
        actual = await fingerprint(path.join(project, file));
      } catch (error) {
        if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
      }
      if (actual !== previous.files[file]) findings.push(`LOCAL CHANGE: ${file}`);
      if (previous.files[file] !== upcoming.files[file])
        findings.push(`UPSTREAM CHANGE (review required): ${file}`);
    }
    return findings;
  } finally {
    await rm(temporary, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
  }
}
