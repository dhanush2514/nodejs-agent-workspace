import type { Express, RequestHandler } from "express";
import type { Endpoint } from "./endpoint.js";
import type { Authenticator } from "../security/authenticator.js";
import { securityMiddleware } from "../security/security-middleware.js";

export function registerEndpoint(
  app: Express,
  endpoint: Endpoint,
  auth: Authenticator,
  handler: RequestHandler,
): void {
  if (endpoint.permission !== null && !endpoint.permission.trim()) {
    throw new Error("Protected endpoints require an explicit nonempty permission.");
  }
  const middleware = endpoint.permission ? securityMiddleware(auth, endpoint.permission) : [];
  app[endpoint.method](endpoint.path, ...middleware, handler);
}
