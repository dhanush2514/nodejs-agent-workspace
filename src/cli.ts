#!/usr/bin/env node
import { parseArgs } from "node:util";
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateOptions } from "./validate-options.js";
import { questionnaire } from "./questionnaire.js";
import { generate } from "./generate.js";
import { run } from "./process-runner.js";
import { compare } from "./compare.js";
import { checkDockerTarget } from "./docker-preflight.js";

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      config: { type: "string" },
      parent: { type: "string" },
      "non-interactive": { type: "boolean" },
      yes: { type: "boolean" },
      docker: { type: "string" },
      compare: { type: "string" },
      project: { type: "string" },
      help: { type: "boolean" },
    },
  });
  if (values.help) {
    console.log(
      "create-node-backend [name] [--parent directory]\n  --config setup.json --non-interactive --yes\n  --docker build|start (opt-in)\n  --compare release.tgz --project directory (read-only)",
    );
    return;
  }
  if (values.compare) {
    if (
      positionals.length ||
      values.config ||
      values.parent ||
      values.docker ||
      values["non-interactive"] ||
      values.yes
    ) {
      throw new Error("--compare accepts only --project; generation flags cannot be combined.");
    }
    console.log(
      (await compare(path.resolve(values.project ?? "."), path.resolve(values.compare))).join(
        "\n",
      ) || "No template drift.",
    );
    return;
  }
  if (values.project) throw new Error("--project requires --compare.");
  if (positionals.length > 1 || (values.config && positionals.length))
    throw new Error("Use one project name OR --config.");
  if (values.docker && !["build", "start"].includes(values.docker))
    throw new Error("--docker must be build or start.");
  if (values["non-interactive"] && (!values.config || !values.yes))
    throw new Error("Non-interactive mode requires --config and --yes.");
  if (!values["non-interactive"] && !process.stdin.isTTY)
    throw new Error("Use --config --non-interactive --yes without an interactive terminal.");
  const terminal = createInterface({ input: process.stdin, output: process.stdout });
  const cancellation = new AbortController();
  const cancel = () => {
    process.exitCode = 130;
    cancellation.abort();
    terminal.close();
  };
  process.once("SIGINT", cancel);
  terminal.once("SIGINT", cancel);
  try {
    const options = values.config
      ? validateOptions(JSON.parse(await readFile(path.resolve(values.config), "utf8")))
      : await questionnaire(terminal, positionals[0]);
    console.log(
      JSON.stringify(
        { ...options, parent: path.resolve(values.parent ?? "."), docker: values.docker ?? "none" },
        null,
        2,
      ),
    );
    if (
      !values.yes &&
      (await terminal.question("Generate and initialize Git? [yes/no] ")).trim().toLowerCase() !==
        "yes"
    ) {
      console.log("Cancelled; no project created.");
      return;
    }
    const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
    const metadata = JSON.parse(await readFile(path.join(root, "package.json"), "utf8"));
    const destination = await generate(
      path.join(root, "bundle"),
      values.parent ?? ".",
      options,
      String(metadata.version),
      cancellation.signal,
    );
    console.log(
      `Created ${destination}. Git has no commits or remote. Auth and deployment approval remain pending.`,
    );
    if (values.docker) {
      cancellation.signal.throwIfAborted();
      checkDockerTarget(options.name);
      const compose = [
        "compose",
        "-f",
        "compose.yaml",
        "-f",
        "compose.development.yaml",
        "-f",
        "deploy/compose/self-hosted-data.yaml",
      ];
      run("docker", [...compose, "build"], destination);
      if (values.docker === "start") {
        cancellation.signal.throwIfAborted();
        run("docker", [...compose, "up", "-d", "--wait", "--wait-timeout", "180"], destination);
      }
    }
    console.log("Read doc/README.md. Planning profiles are not implemented business features.");
  } finally {
    process.removeListener("SIGINT", cancel);
    terminal.close();
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Unexpected generator failure.");
  if (error instanceof Error && error.cause instanceof Error) console.error(error.cause.message);
  if (process.exitCode !== 130) process.exitCode = 1;
});
