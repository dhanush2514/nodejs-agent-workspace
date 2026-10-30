import type { Endpoint } from "../src/platform/http/endpoint.js";

export function validateEndpointDocumentation(endpoint: Endpoint, page: string): void {
  if (!endpoint.purpose.trim()) throw new Error("Endpoint purpose is required.");
  if (endpoint.permission !== null && !endpoint.permission.trim())
    throw new Error("Explicit permission or public status required.");
  endpoint.response.parse(endpoint.example);
  if (!page.includes(`<!-- endpoint ${endpoint.method.toUpperCase()} ${endpoint.path} -->`)) {
    throw new Error(`Missing endpoint documentation: ${endpoint.method} ${endpoint.path}`);
  }
  for (const field of [
    "Purpose",
    "Authentication",
    "Authorization",
    "Request",
    "Response",
    "Errors",
  ]) {
    if (!page.includes(`## ${field}`)) throw new Error(`Missing ${field} in ${endpoint.document}`);
  }
}

export function validateFreshContract(actual: string, expected: string): void {
  if (actual !== expected) throw new Error("OpenAPI is stale; run npm run docs:generate.");
}
