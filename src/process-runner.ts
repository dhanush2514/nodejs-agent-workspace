import { spawnSync } from "node:child_process";
import { gitEnvironment } from "./git-environment.js";

export function run(command: string, args: string[], cwd: string): void {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    shell: false,
    env: command === "git" ? gitEnvironment() : process.env,
  });
  if (result.error) throw new Error(`Could not execute ${command}: ${result.error.message}`);
  if (result.status !== 0)
    throw new Error(`${command} failed with status ${result.status ?? result.signal}.`);
}
