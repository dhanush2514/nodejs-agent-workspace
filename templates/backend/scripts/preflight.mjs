import { readFileSync } from "node:fs";
import { X509Certificate, createPrivateKey, createPublicKey } from "node:crypto";
import { spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { requireExternalDatabaseTls } from "../src/config/database-tls.ts";

const setup = JSON.parse(readFileSync("project.setup.json", "utf8"));
if (!["self-hosted", "external"].includes(setup.dataHosting))
  throw new Error("Choose and approve production data hosting in project.setup.json.");
for (const key of [
  "APP_IMAGE",
  "MIGRATION_IMAGE",
  "SERVER_NAME",
  "APPLICATION_SUBNET",
  "DATABASE_URL_FILE",
  "TLS_CERT_FILE",
  "TLS_KEY_FILE",
]) {
  if (!process.env[key]) throw new Error(`Missing ${key}`);
}
for (const key of ["APP_IMAGE", "MIGRATION_IMAGE"]) {
  if (!/@sha256:[a-f0-9]{64}$/u.test(process.env[key]))
    throw new Error(`${key} must use an immutable sha256 digest.`);
}
if (!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/iu.test(process.env.SERVER_NAME))
  throw new Error("SERVER_NAME must be a DNS hostname.");
const certificate = new X509Certificate(readFileSync(process.env.TLS_CERT_FILE));
if (
  !certificate.checkHost(process.env.SERVER_NAME) ||
  Date.parse(certificate.validTo) <= Date.now() ||
  Date.parse(certificate.validFrom) > Date.now()
)
  throw new Error("Certificate host or validity check failed.");
const key = createPrivateKey(readFileSync(process.env.TLS_KEY_FILE));
if (!certificate.publicKey.equals(createPublicKey(key)))
  throw new Error("Certificate/private key mismatch.");
const databaseText = readFileSync(process.env.DATABASE_URL_FILE, "utf8").trim();
let database;
try {
  database = new URL(databaseText);
} catch {
  // URL parser errors can include the secret input; never expose that error.
  throw new Error("Database URL file contains an invalid connection URL.");
}
if (!["postgresql:", "postgres:"].includes(database.protocol))
  throw new Error("Invalid database connection protocol.");
if (setup.dataHosting === "external") requireExternalDatabaseTls(database);
const customCa = database.searchParams.get("sslcert");
if (customCa || process.env.DATABASE_CA_FILE) {
  if (customCa !== "/run/secrets/database-ca" || !process.env.DATABASE_CA_FILE) {
    throw new Error("Set DATABASE_CA_FILE together with sslcert=/run/secrets/database-ca.");
  }
  const certificateAuthority = new X509Certificate(readFileSync(process.env.DATABASE_CA_FILE));
  if (Date.parse(certificateAuthority.validTo) <= Date.now())
    throw new Error("Database certificate is expired.");
}
if (setup.dataHosting === "self-hosted") {
  for (const name of ["POSTGRES_USER", "POSTGRES_DB", "POSTGRES_PASSWORD_FILE"])
    if (!process.env[name]) throw new Error(`Missing ${name}`);
  if (!readFileSync(process.env.POSTGRES_PASSWORD_FILE, "utf8").trim())
    throw new Error("Empty database password file.");
}
const args = [
  "compose",
  "-f",
  "compose.yaml",
  "-f",
  "compose.production.yaml",
  "-f",
  `deploy/compose/${setup.dataHosting === "external" ? "external-data" : "self-hosted-data"}.yaml`,
];
if (setup.dataHosting === "self-hosted")
  args.push("-f", "deploy/compose/self-hosted-production.yaml");
if (customCa) args.push("-f", "deploy/compose/database-ca.yaml");
const result = spawnSync("docker", [...args, "config", "--quiet"], {
  stdio: "inherit",
  shell: false,
});
if (result.error || result.status !== 0) throw new Error("Docker Compose validation failed.");
if (!process.argv.includes("--existing-stack")) {
  for (const port of [80, 443])
    await new Promise((resolve, reject) => {
      const server = createServer();
      server.once("error", reject);
      server.listen(port, "0.0.0.0", () => server.close(resolve));
    });
}
console.log(
  "Configuration preflight passed. Run nginx -t, approve migrations/backup/rollout, then verify HTTPS. This command does not deploy.",
);
