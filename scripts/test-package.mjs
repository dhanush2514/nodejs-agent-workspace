import { mkdtemp, mkdir, writeFile, readFile, readdir, rm, copyFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import assert from "node:assert/strict";
import * as tar from "tar";
import { parse } from "yaml";

const root = await mkdtemp(path.join(tmpdir(), "backend-packaged-test-"));
const metadata = JSON.parse(await readFile("package.json", "utf8"));
const archive = path.resolve("release", `${metadata.name}-${metadata.version}.tgz`);
function execute(args, expected = 0) {
  const result = spawnSync(process.execPath, args, { cwd: root, encoding: "utf8", shell: false });
  assert.equal(result.status, expected, `${result.stdout}\n${result.stderr}`);
  return result;
}
try {
  const executionArchive = path.join(root, path.basename(archive));
  await copyFile(archive, executionArchive);
  const entries = [];
  await tar.t({ file: archive, onReadEntry: (entry) => entries.push(entry.path) });
  assert.ok(
    entries.every(
      (entry) =>
        !/(?:^|\/)(?:node_modules|\.git|\.secrets|\.npmrc|\.env[^/]*)(?:\/|$)/u.test(entry),
    ),
    "Forbidden package content",
  );
  assert.ok(
    entries.every((entry) => !/\.(?:pem|key|pfx|p12)$/iu.test(entry)),
    "Certificate/key material must not be bundled",
  );
  await tar.x({ file: archive, cwd: root, strict: true });
  const binary = path.join(root, "package", "dist", "cli.js");
  // Resolve only the declared generator dependency, not source-checkout modules.
  const packageRoot = path.join(root, "package");
  const npm = process.env.npm_execpath;
  assert.ok(npm, "Run through npm run test:package");
  const install = spawnSync(
    process.execPath,
    [npm, "install", "--omit=dev", "--ignore-scripts", "--no-audit", "--no-fund"],
    {
      cwd: packageRoot,
      encoding: "utf8",
      shell: false,
    },
  );
  assert.equal(install.status, 0, install.stderr);
  execute([binary, "--help"]);
  execute([binary, "--non-interactive"], 1);
  execute([binary, "--compare", archive, "--docker", "start"], 1);
  const config = {
    schemaVersion: 1,
    name: "packaged-sample",
    description: "Isolated archive verification",
    clients: ["user", "driver", "admin"],
    profiles: ["redis", "bullmq"],
    dataHosting: "pending",
  };
  await writeFile(path.join(root, "setup.json"), JSON.stringify(config));
  const destination = path.join(root, "projects with spaces \u00fc");
  await mkdir(destination);
  const args = [
    binary,
    "--config",
    path.join(root, "setup.json"),
    "--parent",
    destination,
    "--non-interactive",
    "--yes",
  ];
  const actualCommand = spawnSync(
    process.execPath,
    [
      npm,
      "exec",
      "--yes",
      `--package=${executionArchive}`,
      "--",
      "create-node-backend",
      ...args.slice(1),
    ],
    { cwd: root, encoding: "utf8", shell: false },
  );
  assert.equal(actualCommand.status, 0, `${actualCommand.stdout}\n${actualCommand.stderr}`);
  const project = path.join(destination, config.name);
  for (const file of [
    ".gitignore",
    ".gitattributes",
    ".dockerignore",
    "package-lock.json",
    "Dockerfile",
    "doc/api/v1/openapi.yaml",
    ".github/copilot-instructions.md",
    ".claude/settings.json",
    ".cursor/rules/project.mdc",
    ".template-manifest.json",
  ]) {
    assert.ok((await readFile(path.join(project, file))).length, `Missing ${file}`);
  }
  for (const client of [".github", ".claude", ".cursor"]) {
    const directories = await readdir(path.join(project, client, "skills"));
    assert.equal(directories.length, 17);
    for (const name of directories) {
      const text = await readFile(path.join(project, client, "skills", name, "SKILL.md"), "utf8");
      const metadata = parse(text.split("---")[1]);
      assert.equal(metadata.name, name);
      assert.ok(metadata.description.length > 30);
    }
    assert.equal((await readdir(path.join(project, client, "agents"))).length, 5);
  }
  const git = spawnSync("git", ["rev-parse", "--verify", "HEAD"], { cwd: project });
  assert.notEqual(git.status, 0, "Generated project must have no commits");
  assert.equal(spawnSync("git", ["remote"], { cwd: project, encoding: "utf8" }).stdout, "");
  const before = await readFile(path.join(project, "README.md"), "utf8");
  execute(args, 1);
  assert.equal(await readFile(path.join(project, "README.md"), "utf8"), before);
  execute([binary, "--compare", archive, "--project", project]);
  const api = parse(await readFile(path.join(project, "doc/api/v1/openapi.yaml"), "utf8"));
  assert.deepEqual(Object.keys(api.paths).sort(), [
    "/api/v1/notes",
    "/health/live",
    "/health/ready",
  ]);
  assert.equal(
    JSON.parse(await readFile(path.join(project, "package-lock.json"), "utf8")).name,
    config.name,
  );
  execute([path.join(project, "scripts", "drift.mjs")], 1);
  const drift = spawnSync(process.execPath, ["scripts/drift.mjs"], {
    cwd: project,
    encoding: "utf8",
  });
  assert.equal(drift.status, 0, drift.stderr);
  if (process.argv.includes("--verify-backend")) {
    for (const command of [
      ["ci", "--no-fund"],
      ["run", "check"],
      ["run", "build"],
    ]) {
      const result = spawnSync(process.execPath, [npm, ...command], {
        cwd: project,
        stdio: "inherit",
        shell: false,
        env: { ...process.env, COVERAGE_DIRECTORY: path.join(root, "backend-coverage") },
      });
      assert.equal(result.status, 0, `Generated backend failed: npm ${command.join(" ")}`);
    }
  }
  console.log(
    "Packed CLI verified outside checkout: independent Git, safe failure, assets, 17 skills x 3 clients, 5 agents x 3 clients, contracts and read-only comparison.",
  );
} finally {
  await rm(root, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
}
