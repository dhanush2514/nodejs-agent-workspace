import { lstat, mkdtemp, readdir, realpath, rename, rm, rmdir } from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import type { SetupOptions } from "./setup-options.js";
import { validateOptions } from "./validate-options.js";
import { render } from "./render.js";
import { run } from "./process-runner.js";
import { gitEnvironment } from "./git-environment.js";

export async function generate(
  template: string,
  parent: string,
  input: SetupOptions,
  version: string,
  signal?: AbortSignal,
): Promise<string> {
  signal?.throwIfAborted();
  const options = validateOptions(input);
  const directory = await realpath(parent);
  const destination = path.join(directory, options.name);
  run("git", ["--version"], directory);
  const enclosing = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd: directory,
    encoding: "utf8",
    shell: false,
    env: gitEnvironment(),
  });
  if (enclosing.error) throw enclosing.error;
  if (enclosing.status === 0)
    throw new Error("Choose a destination outside an existing Git worktree.");
  if (enclosing.status !== 128) throw new Error("Unable to determine Git worktree status.");
  let existed = false;
  try {
    const stat = await lstat(destination);
    if (!stat.isDirectory() || stat.isSymbolicLink() || (await readdir(destination)).length)
      throw new Error("Destination is not an empty ordinary directory.");
    existed = true;
  } catch (error) {
    if (!(error instanceof Error && "code" in error && error.code === "ENOENT")) throw error;
  }
  const stage = await mkdtemp(path.join(directory, `.create-${options.name}-`));
  try {
    await render(template, stage, options, version, signal);
    signal?.throwIfAborted();
    run("git", ["init", "--initial-branch=main", "--template="], stage);
    signal?.throwIfAborted();
    if (existed) await rmdir(destination);
    // Directory rename is atomic and refuses to replace a nonempty destination.
    await rename(stage, destination);
    return destination;
  } catch (error) {
    throw new Error(
      `Generation failed; inspect ${destination} before retrying. No existing files were overwritten.`,
      { cause: error },
    );
  } finally {
    await rm(stage, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
  }
}
