# Architecture

Each project has its own backend. Within it, use business capabilities, not client
names, as module boundaries. A user app, driver app and admin web may share use
cases while exposing different authorized DTOs. Use optional client adapters only
when contracts differ; never duplicate business rules.

Keep routes, controllers, services, interfaces, repositories, request/response DTOs,
schemas, domain models, mapping and policies separate. One primary type per file.
Interfaces do not share implementation files. Dependencies are explicitly composed
in bootstrap, not fetched from a global service locator.

SOLID: one reason to change; narrow interfaces; substitutable implementations; extend
through deliberate composition; business logic depends on abstractions, not Prisma
or Express. Do not manufacture abstractions or generic CRUD base classes.

Use module `public/` contracts for cross-module orchestration. Repositories own
queries, not business workflows. HTTP controllers perform translation only.
Multiple client apps do not imply multi-tenancy or microservices.
