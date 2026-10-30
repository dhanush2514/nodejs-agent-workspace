# Notes sample API

<!-- endpoint GET /api/v1/notes -->
<!-- endpoint POST /api/v1/notes -->

## Purpose

Demonstrate the full module architecture, not a production business feature.
GET lists sample notes in stable UUID ascending order; this is not creation-time
ordering. POST persists one note. Intended clients are those approved for this project.

## Authentication

Required but not configured. Default runtime returns 401 for both endpoints.
No token/header can bypass this. Success examples describe the contract exercised
by tests using a test-only identity provider, not an available production login.

## Authorization

GET requires `notes:read`; POST requires `notes:write`. Verified identity without
the permission receives 403. The sample has no invented tenant/ownership model;
approve one before adapting it to sensitive or user-owned business data.

## Request

GET `/api/v1/notes?limit=20&cursor=00000000-0000-4000-8000-000000000001`
has no body. Limit defaults to 20, minimum 1, maximum 100. Cursor is an exclusive
UUID lower bound. Unknown query fields are rejected.

POST `/api/v1/notes`, `Content-Type: application/json`, body:

```json
{ "title": "Example note" }
```

Title is trimmed and must contain 1-120 characters. Unknown fields are rejected.
Request body limit is 64 KiB. No idempotency guarantee: retrying POST can create
another note. No client-specific contract is implied by naming clients in setup.

## Response

POST returns 201:

```json
{
  "data": {
    "id": "00000000-0000-4000-8000-000000000001",
    "title": "Example note",
    "createdAt": "2026-01-01T00:00:00.000Z"
  }
}
```

GET returns 200 with `data` as an array of the same DTO and
`meta: { "nextCursor": null }`, or a UUID when more rows exist.
Continue with that cursor; concurrent inserts/deletions can affect later pages.

## Errors

400 invalid input; 401 missing/unverified identity; 403 insufficient permission;
413 oversized body; 500 sanitized unexpected failure. Example:

```json
{
  "type": "about:blank",
  "title": "Authentication required",
  "status": 401,
  "requestId": "00000000-0000-4000-8000-000000000001"
}
```

See [system explanation](../../systems/notes.md) and
[authentication](../../systems/authentication.md).
