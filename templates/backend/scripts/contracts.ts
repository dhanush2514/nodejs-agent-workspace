import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { stringify } from "yaml";
import { noteEndpoints } from "../src/modules/notes/routes/v1/note-endpoints.js";
import { healthEndpoints } from "../src/platform/http/health-endpoints.js";
import type { Endpoint } from "../src/platform/http/endpoint.js";
import { validateEndpointDocumentation, validateFreshContract } from "./contract-validation.js";

const paths: Record<string, Record<string, unknown>> = {};
const endpoints: Endpoint[] = [...noteEndpoints, ...healthEndpoints];
const problem = {
  type: "object",
  required: ["type", "title", "status", "requestId"],
  properties: {
    type: { type: "string" },
    title: { type: "string" },
    status: { type: "integer" },
    requestId: { type: "string", format: "uuid" },
  },
};
for (const endpoint of endpoints) {
  const page = await readFile(endpoint.document, "utf8");
  validateEndpointDocumentation(endpoint, page);
  if (paths[endpoint.path]?.[endpoint.method]) throw new Error("Duplicate API operation.");
  const responses: Record<string, unknown> = {
    [endpoint.status]: {
      description: endpoint.purpose,
      content: {
        "application/json": {
          schema: z.toJSONSchema(endpoint.response),
          example: endpoint.example,
        },
      },
    },
  };
  for (const status of [400, 401, 403, 404, 413, 500, 503])
    responses[status] = {
      description: `Problem Details (${status})`,
      content: { "application/problem+json": { schema: problem } },
    };
  const operation: Record<string, unknown> = {
    summary: endpoint.purpose,
    "x-authentication": endpoint.permission
      ? "required; provider is pending approval; starter denies all access"
      : "public",
    "x-permission": endpoint.permission,
    responses,
  };
  if (endpoint.request)
    operation.requestBody = {
      required: true,
      content: {
        "application/json": {
          schema: z.toJSONSchema(endpoint.request),
          example: endpoint.request.parse({ title: "Example note" }),
        },
      },
    };
  if (endpoint.method === "get" && endpoint.path === "/api/v1/notes")
    operation.parameters = [
      {
        in: "query",
        name: "limit",
        schema: { type: "integer", minimum: 1, maximum: 100, default: 20 },
      },
      { in: "query", name: "cursor", schema: { type: "string", format: "uuid" } },
    ];
  (paths[endpoint.path] ??= {})[endpoint.method] = operation;
}
const output = stringify({
  openapi: "3.1.0",
  info: {
    title: "Backend API",
    version: "1.0.0",
    description:
      "Protected sample endpoints are unavailable until an approved authentication integration is implemented. No authentication scheme is inferred.",
  },
  paths,
});
const target = "doc/api/v1/openapi.yaml";
if (process.argv.includes("--check")) {
  validateFreshContract(await readFile(target, "utf8"), output);
  console.log("Endpoint metadata, examples, documentation coverage and OpenAPI freshness passed.");
} else await writeFile(target, output);
