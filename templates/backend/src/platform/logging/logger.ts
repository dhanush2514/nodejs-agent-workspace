import { pino } from "pino";

export function createLogger(level = "info") {
  return pino({
    level,
    redact: {
      paths: ["password", "token", "authorization", "cookie", "headers", "body", "databaseUrl"],
      censor: "[REDACTED]",
    },
  });
}
