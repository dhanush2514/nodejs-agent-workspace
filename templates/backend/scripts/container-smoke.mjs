import { mkdtemp, writeFile, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { spawnSync } from "node:child_process";
import { request } from "node:https";
import { createServer } from "node:net";
import assert from "node:assert/strict";
import { stringify } from "yaml";

const owned = await mkdtemp(path.join(tmpdir(), "backend-container-test-"));
const project = `backend-test-${randomUUID().slice(0, 8)}`;
const image = `${project}:test`;
const environment = { ...process.env, APPLICATION_SUBNET: "172.29.244.0/24" };
let compose = [];
function docker(args, expected = 0) {
  const result = spawnSync("docker", args, { encoding: "utf8", shell: false, env: environment });
  if (result.error) throw result.error;
  assert.equal(result.status, expected, `${args.join(" ")}\n${result.stdout}\n${result.stderr}`);
  return result.stdout;
}
async function port() {
  return new Promise((resolve, reject) => {
    const server = createServer();
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") throw new Error("Missing test port.");
      server.close(() => resolve(address.port));
    });
  });
}
function httpsGet(portNumber, pathname) {
  return new Promise((resolve, reject) => {
    // Test-only self-signed certificate. Never change application TLS verification.
    const req = request(
      { hostname: "127.0.0.1", port: portNumber, path: pathname, rejectUnauthorized: false },
      (res) => {
        res.resume();
        res.on("end", () => resolve(res.statusCode));
      },
    );
    req.on("error", reject);
    req.setTimeout(15000, () =>
      req.destroy(new Error("Timed out waiting for HTTPS smoke response.")),
    );
    req.end();
  });
}
try {
  docker(["version"]);
  docker(["build", "--target", "test", "-t", image, "."]);
  docker([
    "run",
    "--rm",
    "-v",
    `${owned}:/certs`,
    "--entrypoint",
    "openssl",
    image,
    "req",
    "-x509",
    "-newkey",
    "rsa:2048",
    "-nodes",
    "-days",
    "1",
    "-subj",
    "/CN=localhost",
    "-addext",
    "subjectAltName=DNS:localhost",
    "-keyout",
    "/certs/key.pem",
    "-out",
    "/certs/cert.pem",
  ]);
  const http = await port();
  const https = await port();
  const overlay = path.join(owned, "smoke.yaml");
  const database = "postgresql://test:test-only@postgres:5432/test";
  await writeFile(
    overlay,
    stringify({
      services: {
        api: {
          environment: {
            NODE_ENV: "production",
            DATA_HOSTING: "self-hosted",
            DATABASE_URL: database,
            TRUST_PROXY: "172.29.244.0/24",
          },
        },
        migrate: { environment: { DATABASE_URL: database } },
        postgres: {
          environment: {
            POSTGRES_USER: "test",
            POSTGRES_PASSWORD: "test-only",
            POSTGRES_DB: "test",
          },
        },
        nginx: {
          ports: [`127.0.0.1:${http}:8080`, `127.0.0.1:${https}:8443`],
          environment: { SERVER_NAME: "localhost", NGINX_ENVSUBST_FILTER: "^SERVER_NAME$" },
          volumes: [
            `${path.resolve("deploy/nginx/production.conf.template").replaceAll("\\", "/")}:/etc/nginx/templates/default.conf.template:ro`,
            `${owned.replaceAll("\\", "/")}/cert.pem:/etc/nginx/tls/fullchain.pem:ro`,
            `${owned.replaceAll("\\", "/")}/key.pem:/etc/nginx/tls/private.key:ro`,
          ],
        },
      },
    }),
  );
  compose = [
    "compose",
    "--project-name",
    project,
    "-f",
    path.resolve("compose.yaml"),
    "-f",
    path.resolve("deploy/compose/self-hosted-data.yaml"),
    "-f",
    overlay,
  ];
  docker([...compose, "config", "--quiet"]);
  docker([...compose, "up", "-d", "--build", "--wait", "--wait-timeout", "180"]);
  docker([...compose, "exec", "-T", "nginx", "nginx", "-t"]);
  const missingCertificate = path.join(owned, "missing-certificate.conf.template");
  await writeFile(
    missingCertificate,
    (await readFile("deploy/nginx/production.conf.template", "utf8")).replace(
      "/etc/nginx/tls/fullchain.pem",
      "/etc/nginx/tls/missing.pem",
    ),
  );
  docker(
    [
      ...compose,
      "run",
      "--rm",
      "--no-deps",
      "-v",
      `${missingCertificate.replaceAll("\\", "/")}:/etc/nginx/templates/default.conf.template:ro`,
      "nginx",
      "nginx",
      "-t",
    ],
    1,
  );
  docker(
    [
      ...compose,
      "run",
      "--rm",
      "--no-deps",
      "-e",
      "DATABASE_URL=postgresql://test:test-only@127.0.0.1:1/test?connect_timeout=1",
      "migrate",
    ],
    1,
  );
  assert.equal(await httpsGet(https, "/health/live"), 200);
  assert.equal(await httpsGet(https, "/health/ready"), 200);
  assert.equal(await httpsGet(https, "/api/v1/notes"), 401);
  const redirect = await fetch(`http://127.0.0.1:${http}/health/live`, {
    redirect: "manual",
    signal: AbortSignal.timeout(15000),
  });
  assert.equal(redirect.status, 308);
  assert.equal(redirect.headers.get("location"), "https://localhost/health/live");
  const network = `${project}_application`;
  docker(["run", "--rm", "--network", network, "-e", `DATABASE_URL=${database}`, image]);
  docker([...compose, "up", "-d", "--force-recreate", "--no-deps", "--wait", "api"]);
  await new Promise((resolve) => setTimeout(resolve, 12000));
  assert.equal(await httpsGet(https, "/health/ready"), 200);
  docker([
    ...compose,
    "exec",
    "-T",
    "postgres",
    "psql",
    "-U",
    "test",
    "-d",
    "test",
    "-c",
    "INSERT INTO notes(id,title) VALUES('00000000-0000-4000-8000-000000000001','persistence-fixture')",
  ]);
  docker([...compose, "stop", "postgres"]);
  assert.equal(await httpsGet(https, "/health/ready"), 503);
  assert.equal(await httpsGet(https, "/health/live"), 200);
  docker([...compose, "start", "postgres"]);
  await new Promise((resolve) => setTimeout(resolve, 10000));
  assert.match(
    docker([
      ...compose,
      "exec",
      "-T",
      "postgres",
      "psql",
      "-U",
      "test",
      "-d",
      "test",
      "-tAc",
      "SELECT title FROM notes WHERE id='00000000-0000-4000-8000-000000000001'",
    ]),
    /persistence-fixture/u,
  );
  docker([...compose, "stop", "api"]);
  assert.match(docker([...compose, "logs", "--no-color", "api"]), /Shutdown complete/u);
  console.log(
    "Disposable container smoke passed: PostgreSQL, HTTPS, missing certificates, failed migrations, readiness isolation, replacement, persistence and shutdown.",
  );
} finally {
  if (compose.length) {
    const cleanup = spawnSync("docker", [...compose, "down", "--volumes", "--remove-orphans"], {
      stdio: "inherit",
      shell: false,
      env: environment,
    });
    if (cleanup.error || cleanup.status !== 0) {
      console.error(`Cleanup failed for owned test stack ${project}; inspect it explicitly.`);
      process.exitCode = 1;
    }
  }
  await rm(owned, { recursive: true, force: true, maxRetries: 20, retryDelay: 100 });
}
