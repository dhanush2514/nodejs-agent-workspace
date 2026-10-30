import { cp, mkdir, readdir, rm, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

await rm("bundle", { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
const templateRoot = path.resolve("templates/backend");
const allowed = new Set([
  "src",
  "prisma",
  "tests",
  "scripts",
  "doc",
  "deploy",
  ".github",
  ".claude",
  ".cursor",
  "AGENTS.md",
  "CLAUDE.md",
  "README.md",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "eslint.config.js",
  "vitest.config.ts",
  "vitest.integration.config.ts",
  "Dockerfile",
  "compose.yaml",
  "compose.development.yaml",
  "compose.production.yaml",
  ".gitignore",
  ".gitattributes",
  ".dockerignore",
  ".prettierignore",
  ".prettierrc.json",
]);
await cp("templates/backend", "bundle", {
  recursive: true,
  filter: (source) => {
    const relative = path.relative(templateRoot, path.resolve(source));
    if (!relative) return true;
    const parts = relative.split(path.sep);
    return (
      allowed.has(parts[0]) &&
      !parts.some(
        (part) =>
          [
            "node_modules",
            "dist",
            "coverage",
            ".secrets",
            ".git",
            ".npmrc",
            ".deploy.env",
            "deployment.local.json",
          ].includes(part) ||
          part.startsWith(".env") ||
          /\.(pem|key|pfx|p12|tgz|tar)$/iu.test(part),
      )
    );
  },
});
const skills = await readdir("customizations/skills");
for (const client of [".github", ".claude", ".cursor"]) {
  for (const skill of skills) {
    const directory = path.join("bundle", client, "skills", skill.slice(0, -3));
    await mkdir(directory, { recursive: true });
    await cp(path.join("customizations/skills", skill), path.join(directory, "SKILL.md"));
  }
}
const roles = JSON.parse(await readFile("customizations/agents.json", "utf8"));
for (const client of [".github", ".claude", ".cursor"]) {
  await mkdir(path.join("bundle", client, "agents"), { recursive: true });
  for (const role of roles) {
    const tools =
      client === ".github"
        ? `tools: ${JSON.stringify(role.write ? ["read", "search", "edit", "execute"] : role.execute ? ["read", "search", "execute"] : ["read", "search"])}`
        : client === ".claude"
          ? `tools: ${role.write ? "Read, Glob, Grep, Edit, Write, Bash" : role.execute ? "Read, Glob, Grep, Bash" : "Read, Glob, Grep"}`
          : "";
    const suffix = client === ".github" ? ".agent.md" : ".md";
    await writeFile(
      path.join("bundle", client, "agents", `${role.name}${suffix}`),
      `---\nname: ${role.name}\ndescription: ${JSON.stringify(role.description)}\n${tools}\n---\n\nRead AGENTS.md and doc/workflow/change-workflow.md first.\n\n${role.instructions}\n`,
    );
  }
}
for (const name of [".gitignore", ".dockerignore", "package-lock.json"]) {
  await cp(path.join("bundle", name), path.join("bundle", `${name}.asset`));
  await rm(path.join("bundle", name));
}
