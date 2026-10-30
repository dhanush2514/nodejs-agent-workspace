import { readFileSync } from "node:fs";
import { isIPv4 } from "node:net";
import { z } from "zod";
import type { AppConfig } from "./app-config.js";
import { requireExternalDatabaseTls } from "./database-tls.js";

export function loadConfig(env: NodeJS.ProcessEnv): AppConfig {
  if (env.DATABASE_URL && env.DATABASE_URL_FILE)
    throw new Error("Set DATABASE_URL or DATABASE_URL_FILE, not both.");
  const parsed = z
    .object({
      NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
      PORT: z.coerce.number().int().min(1).max(65535).default(3000),
      DATABASE_URL: z.url().regex(/^postgres(?:ql)?:\/\//u),
      DATA_HOSTING: z.enum(["self-hosted", "external"]).optional(),
      TRUST_PROXY: z.string().optional(),
      OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: z.url().optional(),
    })
    .safeParse({
      ...env,
      DATABASE_URL: env.DATABASE_URL_FILE
        ? readFileSync(env.DATABASE_URL_FILE, "utf8").trim()
        : env.DATABASE_URL,
    });
  if (!parsed.success)
    throw new Error(
      `Invalid configuration fields: ${parsed.error.issues.map((issue) => issue.path.join(".")).join(", ")}`,
    );
  const data = parsed.data;
  if (data.DATA_HOSTING === "external") {
    requireExternalDatabaseTls(new URL(data.DATABASE_URL));
  }
  if (data.TRUST_PROXY && !isIPv4(data.TRUST_PROXY.split("/")[0] ?? "")) {
    throw new Error("TRUST_PROXY must contain a valid IPv4 address.");
  }
  if (data.NODE_ENV === "production" && !data.TRUST_PROXY)
    throw new Error("Production requires an explicit trusted proxy CIDR.");
  if (data.NODE_ENV === "production" && !data.DATA_HOSTING) {
    throw new Error("Production requires explicit DATA_HOSTING: self-hosted or external.");
  }
  if (
    data.TRUST_PROXY &&
    !/^(?:\d{1,3}\.){3}\d{1,3}\/(?:[1-9]|[12]\d|3[0-2])$/u.test(data.TRUST_PROXY)
  )
    throw new Error("TRUST_PROXY must be a specific IPv4 CIDR, never true or 0.0.0.0/0.");
  const result: AppConfig = {
    environment: data.NODE_ENV,
    port: data.PORT,
    databaseUrl: data.DATABASE_URL,
    trustProxy: data.TRUST_PROXY ?? false,
  };
  if (data.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT)
    result.otlpEndpoint = data.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;
  return result;
}
