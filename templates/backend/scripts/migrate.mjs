import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { requireExternalDatabaseTls } from "../src/config/database-tls.ts";
if (process.env.DATABASE_URL && process.env.DATABASE_URL_FILE)
  throw new Error("Specify a database URL or file, not both.");
if (process.env.DATABASE_URL_FILE)
  process.env.DATABASE_URL = readFileSync(process.env.DATABASE_URL_FILE, "utf8").trim();
if (!process.env.DATABASE_URL) throw new Error("Database configuration missing.");
if (
  process.env.NODE_ENV === "production" &&
  !["self-hosted", "external"].includes(process.env.DATA_HOSTING)
) {
  throw new Error("Production migrations require an explicit DATA_HOSTING choice.");
}
if (process.env.DATA_HOSTING === "external") {
  let database;
  try {
    database = new URL(process.env.DATABASE_URL);
  } catch {
    throw new Error("Invalid external database URL; check the mounted secret.");
  }
  requireExternalDatabaseTls(database);
}
const result = spawnSync(
  process.execPath,
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  { stdio: "inherit", shell: false },
);
if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
