import ts from "typescript";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function inspectSource(filename, content) {
  const file = filename.replaceAll("\\", "/");
  const tree = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);
  const errors = [];
  const types = tree.statements.filter(
    (statement) =>
      ts.isInterfaceDeclaration(statement) ||
      ts.isClassDeclaration(statement) ||
      ts.isTypeAliasDeclaration(statement) ||
      ts.isEnumDeclaration(statement),
  );
  if (types.length > 1) errors.push(`${file}: one primary type per file`);
  if (
    types.some(ts.isInterfaceDeclaration) &&
    tree.statements.some(
      (statement) => ts.isClassDeclaration(statement) || ts.isFunctionDeclaration(statement),
    )
  ) {
    errors.push(`${file}: interface must not share implementation file`);
  }
  const moduleName = file.match(/modules\/([^/]+)\//u)?.[1];
  for (const statement of tree.statements) {
    if (!ts.isImportDeclaration(statement) || !ts.isStringLiteral(statement.moduleSpecifier))
      continue;
    const target = statement.moduleSpecifier.text;
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(file), target));
    const targetModule = resolved.match(/modules\/([^/]+)\//u)?.[1];
    if (
      moduleName &&
      targetModule &&
      moduleName !== targetModule &&
      !resolved.includes(`modules/${targetModule}/public/`)
    ) {
      errors.push(`${file}: cross-module access must use public contracts`);
    }
    if (
      /\/(controllers|services|dtos|models)\//u.test(file) &&
      (target === "express" || target.startsWith("@prisma/") || /\/repositories\//u.test(resolved))
    ) {
      errors.push(`${file}: business/DTO layer cannot import HTTP or persistence implementation`);
    }
  }
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      ts.isPropertyAccessExpression(node.expression) &&
      ["get", "post", "put", "patch", "delete", "route"].includes(node.expression.name.text) &&
      ["app", "router"].includes(node.expression.expression.getText(tree)) &&
      !file.endsWith("/register-endpoint.ts")
    )
      errors.push(`${file}: register endpoints through registerEndpoint`);
    ts.forEachChild(node, visit);
  }
  visit(tree);
  return errors;
}

async function check(directory) {
  const errors = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) errors.push(...(await check(file)));
    else if (file.endsWith(".ts"))
      errors.push(...inspectSource(file, await readFile(file, "utf8")));
  }
  return errors;
}
if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const errors = await check("src");
  if (errors.length) throw new Error(errors.join("\n"));
  console.log("Architecture checks passed.");
}
