# Architecture

`__PROJECT_NAME__` is one independent project. Its client apps share capabilities,
not unrelated projects' databases or runtime. Read `project.setup.json` for clients.

- `bootstrap/`: configuration, lifecycle and explicit dependency composition.
- `platform/`: HTTP, logging, security and telemetry infrastructure.
- `modules/notes/`: sample routes/contracts, controller, service, repository
  interface/Prisma implementation, models, DTOs, schemas and mapper.
- `prisma/`: schema and reviewed migrations.
- `doc/`: API/system/operational explanations and decisions.

Optional client adapters compose public use cases when client DTOs differ.
Cross-module persistence imports are prohibited by architecture checks.
Do not create a module per frontend or a microservice per folder automatically.
