import type { ErrorRequestHandler } from "express";
import type { Logger } from "pino";
import { ZodError } from "zod";
import { HttpError } from "./http-error.js";

export function errorHandler(logger: Logger): ErrorRequestHandler {
  return (error: unknown, _request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }
    const bodyError =
      error instanceof Error && "type" in error
        ? error.type === "entity.too.large"
          ? 413
          : error.type === "entity.parse.failed"
            ? 400
            : undefined
        : undefined;
    const status =
      error instanceof HttpError
        ? error.status
        : error instanceof ZodError
          ? 400
          : (bodyError ?? 500);
    const title =
      error instanceof HttpError
        ? error.title
        : status === 400
          ? "Invalid request"
          : status === 413
            ? "Request body too large"
            : "Internal server error";
    if (status >= 500)
      logger.error(
        {
          event: "request_failed",
          requestId: response.getHeader("x-request-id"),
          errorType: error instanceof Error ? error.name : "Unknown",
        },
        "Request failed; inspect correlated traces",
      );
    response
      .status(status)
      .type("application/problem+json")
      .json({
        type: "about:blank",
        title,
        status,
        requestId: response.getHeader("x-request-id"),
      });
  };
}
