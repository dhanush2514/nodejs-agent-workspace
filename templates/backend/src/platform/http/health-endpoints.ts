import { z } from "zod";
import type { Endpoint } from "./endpoint.js";
export const healthEndpoints = [
  {
    method: "get",
    path: "/health/live",
    purpose: "Process liveness",
    permission: null,
    status: 200,
    document: "doc/api/v1/health.md",
    response: z.strictObject({ data: z.strictObject({ status: z.literal("ok") }) }),
    example: { data: { status: "ok" } },
  },
  {
    method: "get",
    path: "/health/ready",
    purpose: "Database readiness",
    permission: null,
    status: 200,
    document: "doc/api/v1/health.md",
    response: z.strictObject({ data: z.strictObject({ status: z.literal("ready") }) }),
    example: { data: { status: "ready" } },
  },
] satisfies Endpoint[];
