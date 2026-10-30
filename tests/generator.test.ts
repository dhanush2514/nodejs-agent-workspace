import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtemp, mkdir, writeFile, readFile, readdir, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import * as tar from "tar";
import { validateOptions } from "../src/validate-options.js";
import { questionnaire } from "../src/questionnaire.js";
import { generate } from "../src/generate.js";
import { render } from "../src/render.js";
import { run } from "../src/process-runner.js";
import { compare } from "../src/compare.js";
import { fingerprint, listFiles } from "../src/files.js";
import { gitEnvironment } from "../src/git-environment.js";

const temporary: string[] = [];
const options = {
  schemaVersion: 1 as const,
  name: "test-backend",
  description: "",
  clients: ["user"],
  profiles: [],
  dataHosting: "pending" as const,
};
async function fixture() {
  const root = await mkdtemp(path.join(tmpdir(), "backend-generator-test-"));
  temporary.push(root);
  const template = path.join(root, "template");
  await mkdir(template);
  await writeFile(path.join(template, "package.json"), '{"name":"template","version":"1.0.0"}\n');
  await writeFile(
    path.join(template, "package-lock.json.asset"),
    '{"name":"template","packages":{"":{"name":"template"}}}\n',
  );
  await writeFile(path.join(template, ".gitignore.asset"), "node_modules/\n");
  await writeFile(path.join(template, "README.md"), "# __PROJECT_NAME__\n");
  const parent = path.join(root, "projects with spaces \u00fc");
  await mkdir(parent);
  return { root, template, parent };
}
afterEach(async () => {
  for (const root of temporary.splice(0)) await rm(root, { recursive: true, force: true });
});
describe("validated setup", () => {
  it("isolates Git repository selection without modifying the caller environment", () => {
    vi.stubEnv("GIT_DIR", "unrelated-repository");
    try {
      expect(gitEnvironment().GIT_DIR).toBeUndefined();
      expect(process.env.GIT_DIR).toBe("unrelated-repository");
    } finally {
      vi.unstubAllEnvs();
    }
  });
  it("accepts explicit controlled choices", () =>
    expect(validateOptions(options)).toEqual(options));
  it.each([
    null,
    [],
    42,
    { ...options, secret: "no" },
    { ...options, schemaVersion: 2 },
    ...["../escape", "Bad Name", "nul", "x".repeat(65), ""].map((name) => ({ ...options, name })),
    { ...options, description: "\n" },
    { ...options, description: 1 },
    { ...options, clients: "user" },
    { ...options, clients: [] },
    { ...options, clients: ["a", "a"] },
    { ...options, clients: [""] },
    { ...options, clients: ["x".repeat(81)] },
    { ...options, profiles: ["unknown"] },
    { ...options, profiles: ["bullmq"] },
    { ...options, dataHosting: "maybe" },
  ])("rejects invalid input %#", (value) => expect(() => validateOptions(value)).toThrow());
  it("prompts without choosing authentication", async () => {
    const answers = ["my-api", "Example", "user, driver", "redis,bullmq", "external"];
    const question = vi.fn(async () => answers.shift() ?? "");
    expect(await questionnaire({ question })).toMatchObject({
      name: "my-api",
      profiles: ["redis", "bullmq"],
      dataHosting: "external",
    });
    const empty = ["", "user", "", ""];
    expect(
      await questionnaire({ question: async () => empty.shift() ?? "" }, "named-api"),
    ).toMatchObject({ name: "named-api", profiles: [], dataHosting: "pending" });
  });
});
describe("safe and reproducible generation", () => {
  it("cancels before generation without creating any files", async () => {
    const { template, parent } = await fixture();
    const cancellation = new AbortController();
    cancellation.abort(new Error("Cancelled"));
    await expect(generate(template, parent, options, "1.0.0", cancellation.signal)).rejects.toThrow(
      "Cancelled",
    );
    expect(await readdir(parent)).toEqual([]);
  });
  it("aborts rendering and preserves the existing parent", async () => {
    const { template, parent } = await fixture();
    const cancellation = new AbortController();
    cancellation.abort(new Error("Cancelled"));
    await expect(render(template, parent, options, "1.0.0", cancellation.signal)).rejects.toThrow(
      "Cancelled",
    );
    expect(await readdir(parent)).toEqual([]);
  });
  it("creates an independent empty Git repo and renders lockfile metadata", async () => {
    const { template, parent } = await fixture();
    const project = await generate(template, parent, options, "1.0.0");
    expect(await readFile(path.join(project, "README.md"), "utf8")).toContain("test-backend");
    expect(
      JSON.parse(await readFile(path.join(project, "package-lock.json"), "utf8")).packages[""].name,
    ).toBe(options.name);
    expect(spawnSync("git", ["rev-parse", "--verify", "HEAD"], { cwd: project }).status).not.toBe(
      0,
    );
    expect(spawnSync("git", ["remote"], { cwd: project, encoding: "utf8" }).stdout).toBe("");
    const second = path.join(parent, "rendered");
    await mkdir(second);
    await render(template, second, options, "1.0.0");
    expect(await fingerprint(path.join(second, ".template-manifest.json"))).toBe(
      await fingerprint(path.join(project, ".template-manifest.json")),
    );
  });
  it("accepts an existing empty destination and rejects occupied destinations", async () => {
    const { template, parent } = await fixture();
    const target = path.join(parent, options.name);
    await mkdir(target);
    await generate(template, parent, options, "1.0.0");
    await expect(generate(template, parent, options, "1.0.0")).rejects.toThrow("not an empty");
    expect(await readFile(path.join(target, "README.md"), "utf8")).toContain(options.name);
  });
  it("rejects enclosing repositories and cleans only owned staging on render failure", async () => {
    const { root, template, parent } = await fixture();
    run("git", ["init"], parent);
    await expect(generate(template, parent, options, "1.0.0")).rejects.toThrow("outside");
    const other = path.join(root, "other");
    await mkdir(other);
    await writeFile(path.join(template, "package.json"), "invalid json");
    await expect(generate(template, other, options, "1.0.0")).rejects.toThrow("Generation failed");
    expect(await readdir(other)).toEqual([]);
  });
  it("reports failed and missing executables", () => {
    expect(() => run(process.execPath, ["-e", "process.exit(3)"], process.cwd())).toThrow(
      "status 3",
    );
    expect(() => run("not-a-real-backend-command", [], process.cwd())).toThrow("Could not execute");
  });
  it("reads archives for upgrades without modifying a project", async () => {
    const { root, template, parent } = await fixture();
    const project = await generate(template, parent, options, "1.0.0");
    const packed = path.join(root, "package");
    await mkdir(packed);
    const { cp } = await import("node:fs/promises");
    await cp(template, path.join(packed, "bundle"), { recursive: true });
    await writeFile(path.join(packed, "package.json"), '{"version":"1.0.0"}');
    const archive = path.join(root, "release.tgz");
    await tar.c({ gzip: true, file: archive, cwd: root }, ["package"]);
    expect(await compare(project, archive)).toEqual([]);
    await writeFile(path.join(project, "README.md"), "local change");
    expect(await compare(project, archive)).toEqual(["LOCAL CHANGE: README.md"]);
    await writeFile(path.join(packed, "bundle", "README.md"), "new upstream");
    await tar.c({ gzip: true, file: archive, cwd: root }, ["package"]);
    expect(await compare(project, archive)).toContain(
      "UPSTREAM CHANGE (review required): README.md",
    );
    expect(await readFile(path.join(project, "README.md"), "utf8")).toBe("local change");
    const manifest = JSON.parse(
      await readFile(path.join(project, ".template-manifest.json"), "utf8"),
    );
    manifest.files["../escape"] = "bad";
    await writeFile(path.join(project, ".template-manifest.json"), JSON.stringify(manifest));
    await expect(compare(project, archive)).rejects.toThrow("Unsafe manifest");
  });
  it("walks deterministic asset paths", async () => {
    const { template } = await fixture();
    expect(await listFiles(template)).toEqual([
      ".gitignore.asset",
      "README.md",
      "package-lock.json.asset",
      "package.json",
    ]);
  });
});
