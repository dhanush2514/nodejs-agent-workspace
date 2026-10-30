import express from "express";
import helmet from "helmet";
import { randomUUID } from "node:crypto";
import type { AppDependencies } from "./app-dependencies.js";
import { NoteService } from "../modules/notes/services/note-service.js";
import { NoteController } from "../modules/notes/controllers/note-controller.js";
import { noteEndpoints } from "../modules/notes/routes/v1/note-endpoints.js";
import { listNotesSchema } from "../modules/notes/schemas/v1/list-notes-schema.js";
import { createNoteSchema } from "../modules/notes/schemas/v1/create-note-schema.js";
import { healthEndpoints } from "../platform/http/health-endpoints.js";
import { registerEndpoint } from "../platform/http/register-endpoint.js";
import { errorHandler } from "../platform/http/error-handler.js";
import { HttpError } from "../platform/http/http-error.js";

export function createApp(dependencies: AppDependencies) {
  const app = express();
  app.disable("x-powered-by");
  app.set("trust proxy", dependencies.trustProxy);
  app.use(helmet());
  app.use((_request, response, next) => {
    response.setHeader("x-request-id", randomUUID());
    next();
  });
  app.use(express.json({ limit: "64kb" }));
  const controller = new NoteController(new NoteService(dependencies.notes));
  for (const endpoint of noteEndpoints) {
    registerEndpoint(app, endpoint, dependencies.authenticator, async (request, response) => {
      if (endpoint.method === "post")
        response.status(201).json(await controller.create(createNoteSchema.parse(request.body)));
      else response.json(await controller.list(listNotesSchema.parse(request.query)));
    });
  }
  for (const endpoint of healthEndpoints) {
    registerEndpoint(app, endpoint, dependencies.authenticator, async (_request, response) => {
      if (endpoint.path === "/health/ready") {
        try {
          await dependencies.ready();
        } catch (error) {
          dependencies.logger.warn(
            {
              event: "readiness_failed",
              errorType: error instanceof Error ? error.name : "Unknown",
            },
            "Database readiness failed",
          );
          throw new HttpError(503, "Service not ready");
        }
      }
      response.json(endpoint.example);
    });
  }
  app.use(() => {
    throw new HttpError(404, "Endpoint not found");
  });
  app.use(errorHandler(dependencies.logger));
  return app;
}
