import { PrismaClient } from "@prisma/client";
import { loadConfig } from "../config/load-config.js";
import { createLogger } from "../platform/logging/logger.js";
import { startTracing } from "../platform/observability/tracing.js";
import { UnconfiguredAuthenticator } from "../platform/security/unconfigured-authenticator.js";
import { PrismaNoteRepository } from "../modules/notes/repositories/prisma-note-repository.js";
import { createApp } from "./create-app.js";

const config = loadConfig(process.env);
const logger = createLogger();
const tracing = startTracing(config.otlpEndpoint);
const database = new PrismaClient({ datasourceUrl: config.databaseUrl });
const app = createApp({
  notes: new PrismaNoteRepository(database),
  authenticator: new UnconfiguredAuthenticator(),
  ready: async () => {
    await database.$queryRaw`SELECT 1`;
  },
  logger,
  trustProxy: config.trustProxy,
});
const server = app.listen(config.port, "0.0.0.0", () =>
  logger.info({ port: config.port }, "API listening; production authentication is not configured"),
);
server.requestTimeout = 30000;
server.headersTimeout = 15000;
let closing = false;
function shutdown() {
  if (closing) return;
  closing = true;
  const timeout = setTimeout(() => {
    logger.error("Graceful shutdown timed out");
    process.exit(1);
  }, 20000);
  timeout.unref();
  server.close(() => {
    Promise.all([database.$disconnect(), tracing?.shutdown()])
      .then(() => {
        clearTimeout(timeout);
        logger.info("Shutdown complete");
      })
      .catch(() => {
        logger.error("Shutdown failed");
        process.exitCode = 1;
      });
  });
}
process.once("SIGTERM", shutdown);
process.once("SIGINT", shutdown);
