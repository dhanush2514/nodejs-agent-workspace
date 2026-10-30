# API reference

- [Notes endpoints](v1/notes.md)
- [Health endpoints](v1/health.md)
- [Generated OpenAPI](v1/openapi.yaml)

Major versions use `/api/v1`; health endpoints are intentionally unversioned.
Success responses use `{ data, meta? }`; errors use RFC 9457 Problem Details.
Server-generated `x-request-id` values correlate requests without trusting client IDs.

The starter has no selected authentication mechanism. Protected endpoints always
deny access in the default server. OpenAPI explicitly marks this pending state
with `x-authentication` and `x-permission`, rather than falsely advertising a usable
Bearer/cookie/OAuth scheme. Replace these with the approved scheme when implemented.

Generate contracts with `npm run docs:generate`; check them with `npm run check:docs`.
Endpoint schemas/metadata and HTTP tests are the source of contract truth.
