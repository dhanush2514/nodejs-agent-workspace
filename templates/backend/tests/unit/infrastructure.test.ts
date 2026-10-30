import { afterEach, describe, expect, it, vi } from "vitest";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { loadConfig } from "../../src/config/load-config.js";
import { PrismaNoteRepository } from "../../src/modules/notes/repositories/prisma-note-repository.js";
import { errorHandler } from "../../src/platform/http/error-handler.js";
import { createLogger } from "../../src/platform/logging/logger.js";
import { startTracing } from "../../src/platform/observability/tracing.js";

vi.mock("@opentelemetry/sdk-node", () => ({
  NodeSDK: class {
    start = vi.fn();
    shutdown = vi.fn();
  },
}));
vi.mock("@opentelemetry/exporter-trace-otlp-http", () => ({ OTLPTraceExporter: class {} }));
const directories: string[] = [];
afterEach(() => {
  for (const directory of directories.splice(0))
    rmSync(directory, { recursive: true, force: true });
  vi.restoreAllMocks();
});
describe("infrastructure boundaries", () => {
  it("validates config and reads mounted secrets without exposing values", () => {
    expect(loadConfig({ DATABASE_URL: "postgresql://test:test@localhost/test" }).port).toBe(3000);
    expect(() => loadConfig({ DATABASE_URL: "bad secret" })).toThrow(
      "Invalid configuration fields",
    );
    expect(() => loadConfig({ DATABASE_URL: "postgresql://x/y", NODE_ENV: "production" })).toThrow(
      "trusted proxy",
    );
    expect(() => loadConfig({ DATABASE_URL: "postgresql://x/y", TRUST_PROXY: "true" })).toThrow(
      "IPv4",
    );
    expect(() => loadConfig({ DATABASE_URL: "x", DATABASE_URL_FILE: "file" })).toThrow("not both");
    const directory = mkdtempSync(path.join(tmpdir(), "backend-secret-test-"));
    directories.push(directory);
    const file = path.join(directory, "url");
    writeFileSync(file, "postgresql://test:test@localhost/test\n");
    expect(
      loadConfig({
        DATABASE_URL_FILE: file,
        NODE_ENV: "production",
        DATA_HOSTING: "self-hosted",
        TRUST_PROXY: "172.28.0.0/24",
        PORT: "3100",
        OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: "http://localhost:4318/v1/traces",
      }),
    ).toMatchObject({
      port: 3100,
      environment: "production",
      trustProxy: "172.28.0.0/24",
      otlpEndpoint: "http://localhost:4318/v1/traces",
    });
  });
  it("issues bounded keyset queries with the injected database", async () => {
    const database = new PrismaClient({ datasourceUrl: "postgresql://test:test@localhost/test" });
    const row = {
      id: "00000000-0000-4000-8000-000000000001",
      title: "Example",
      createdAt: new Date(),
    };
    const create = vi.spyOn(database.note, "create").mockResolvedValue(row);
    const list = vi.spyOn(database.note, "findMany").mockResolvedValue([row]);
    const repository = new PrismaNoteRepository(database);
    expect(await repository.create("Example")).toEqual(row);
    expect(create).toHaveBeenCalledWith({ data: { title: "Example" } });
    await repository.list({ limit: 20 });
    expect(list).toHaveBeenLastCalledWith({ where: {}, orderBy: { id: "asc" }, take: 21 });
    await repository.list({ limit: 1, cursor: row.id });
    expect(list).toHaveBeenLastCalledWith({
      where: { id: { gt: row.id } },
      orderBy: { id: "asc" },
      take: 2,
    });
    await database.$disconnect();
  });
  it("only starts telemetry when configured", () => {
    expect(startTracing()).toBeUndefined();
    expect(startTracing("http://localhost:4318/v1/traces")).toBeDefined();
  });
  it("has an Express error middleware with four arguments", () => {
    expect(errorHandler(createLogger("silent")).length).toBe(4);
  });
});
