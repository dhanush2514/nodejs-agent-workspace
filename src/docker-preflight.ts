import { spawnSync } from "node:child_process";

function capture(args: string[]): string {
  const result = spawnSync("docker", args, { encoding: "utf8", shell: false });
  if (result.error) throw new Error(`Docker is unavailable: ${result.error.message}`);
  if (result.status !== 0)
    throw new Error("Docker preflight failed. Check the selected local Docker engine.");
  return result.stdout.trim();
}

export function checkDockerTarget(
  name: string,
  environment: NodeJS.ProcessEnv = process.env,
  read: (args: string[]) => string = capture,
): void {
  const endpoint =
    environment.DOCKER_CONTEXT || !environment.DOCKER_HOST
      ? read(["context", "inspect", "--format", "{{.Endpoints.docker.Host}}"])
      : environment.DOCKER_HOST;
  if (!/^(?:unix|npipe):\/\//u.test(endpoint)) {
    throw new Error(
      "Automatic Docker actions require a local unix/npipe context. Remote/TCP deployment needs separate approval.",
    );
  }
  for (const resource of ["container", "volume", "network"]) {
    const args = [resource, "ls"];
    if (resource === "container") args.push("--all");
    args.push(
      "--filter",
      `label=com.docker.compose.project=${name}`,
      "--format",
      resource === "volume" ? "{{.Name}}" : "{{.ID}}",
    );
    if (read(args))
      throw new Error(
        `Docker project '${name}' already owns ${resource} resources; refusing to alter an existing stack.`,
      );
  }
}
