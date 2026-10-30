import { describe, expect, it } from "vitest";
import { requireExternalDatabaseTls } from "../../src/config/database-tls.js";
import { loadConfig } from "../../src/config/load-config.js";

describe("external PostgreSQL certificate verification", () => {
  it("blocks production without an explicit data hosting mode", () => {
    expect(() =>
      loadConfig({
        NODE_ENV: "production",
        TRUST_PROXY: "172.28.0.0/24",
        DATABASE_URL: "postgresql://fixture@localhost/test",
      }),
    ).toThrow("DATA_HOSTING");
  });
  it.each([
    "",
    "sslmode=prefer&sslaccept=strict",
    "sslmode=verify-full&sslaccept=strict",
    "sslmode=verify-ca&sslaccept=strict",
    "sslmode=require",
    "sslmode=require&sslaccept=accept_invalid_certs",
    "sslmode=require&sslmode=disable&sslaccept=strict",
    "sslmode=require&sslaccept=strict&sslaccept=accept_invalid_certs",
  ])("rejects settings that do not enforce Prisma TLS verification: %s", (parameters) =>
    expect(() =>
      requireExternalDatabaseTls(new URL(`postgresql://fixture@localhost/test?${parameters}`)),
    ).toThrow("sslaccept=strict"),
  );
  it("accepts Prisma-supported encryption and strict certificate verification", () => {
    const url = "postgresql://fixture@localhost/test?sslmode=require&sslaccept=strict";
    expect(() => requireExternalDatabaseTls(new URL(url))).not.toThrow();
    expect(loadConfig({ DATABASE_URL: url, DATA_HOSTING: "external" }).databaseUrl).toBe(url);
    expect(() =>
      loadConfig({ DATABASE_URL: "postgresql://fixture@localhost/test", DATA_HOSTING: "external" }),
    ).toThrow("sslaccept=strict");
    expect(() => requireExternalDatabaseTls(new URL(`${url}&sslcert=a&sslcert=b`))).toThrow(
      "at most one",
    );
  });
});
