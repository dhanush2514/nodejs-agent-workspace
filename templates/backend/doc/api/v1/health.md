# Health endpoints

<!-- endpoint GET /health/live -->
<!-- endpoint GET /health/ready -->

## Purpose

Liveness checks whether the process handles HTTP; readiness runs `SELECT 1` against
PostgreSQL. They intentionally reveal no database URL or detailed dependency error.

## Authentication

Explicitly public and unversioned. Do not expose additional sensitive diagnostics.

## Authorization

No user permission is required for these minimal health signals.

## Request

GET either path; no request body or required credential/header.

## Response

Liveness: 200, `{ "data": { "status": "ok" } }`.
Readiness: 200, `{ "data": { "status": "ready" } }`.
Both include a server-generated `x-request-id`.

## Errors

Readiness returns 503 Problem Details with title `Service not ready` if the database
check fails. Process liveness remains independent. Unknown endpoints return 404.
