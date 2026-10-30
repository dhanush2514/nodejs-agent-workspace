---
name: node-api-module
description: "Use to design or implement Express API endpoints, capability modules, request/response DTOs, validation and API versioning."
---

# API/module implementation

Prerequisite: approved requirement, permission policy, API contract and plan.

1. Read `doc/standards/architecture.md` and `doc/standards/api.md`; reuse existing
   public module contracts before adding a capability.
2. Separate routes, schemas, request/response DTOs, controller, service, repository
   interface/implementation, domain model and mapping into single-responsibility files.
3. Register through the endpoint registry. Authenticate and authorize before
   business execution; enforce resource/tenant policies in the use case as needed.
4. Bound query/body input, use the approved envelope/problem details/versioning, and
   define cursor ordering, status codes and side effects explicitly.
5. Add unit, permission, invalid-input, failure and actual response-contract tests.
6. Update `doc/api/` and system docs; generate OpenAPI and run architecture/docs checks.

Failure: do not expose tables as endpoints, use a generic bypass controller, or
return persistence models. Missing business/authorization decisions block coding.
