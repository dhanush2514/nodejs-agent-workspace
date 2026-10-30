import type { Request, RequestHandler } from "express";
import type { Authenticator } from "./authenticator.js";
import type { Principal } from "./principal.js";
import { HttpError } from "../http/http-error.js";

export function securityMiddleware(
  authenticator: Authenticator,
  permission: string,
): RequestHandler[] {
  const principals = new WeakMap<Request, Principal>();
  const authenticate: RequestHandler = async (request, _response, next) => {
    const principal = await authenticator.authenticate(request.headers);
    if (!principal) throw new HttpError(401, "Authentication required");
    principals.set(request, principal);
    next();
  };
  const authorize: RequestHandler = (request, _response, next) => {
    if (!principals.get(request)?.permissions.includes(permission))
      throw new HttpError(403, "Permission denied");
    next();
  };
  return [authenticate, authorize];
}
