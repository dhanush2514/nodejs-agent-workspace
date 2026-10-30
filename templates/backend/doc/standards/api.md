# API contracts

Use `/api/v1` major versioning and stable resource-oriented endpoints. Breaking
changes require a compatibility/deprecation plan and ADR. Decide endpoints from
approved use cases; do not mechanically expose database tables.

Success: `{ data, meta? }`; 204 and other bodyless responses have no envelope.
Errors: RFC 9457 `application/problem+json`, never internal messages or stack traces.
Malformed/invalid input: 400. Missing identity: 401. Insufficient permission: 403,
unless an approved non-disclosure policy intentionally returns another status.

Validate params/query/headers/body and bound their sizes. Cursor pagination defaults
to 20 and caps at 100. Stable ordering and cursor semantics must be documented.
Use dedicated request/response DTOs; reject mass-assignment and unknown input fields.
Mutations that require idempotency need a persisted, scoped design, not just a header.

Register through the endpoint registry; document purpose, authentication,
authorization, inputs, success/error examples and side effects under `doc/api/`.
Regenerate OpenAPI and verify it against runtime contract tests.
