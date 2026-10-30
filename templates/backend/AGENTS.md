# Project engineering instructions

Read [project documentation](doc/README.md), `project.setup.json`, and accepted
[ADRs](doc/decisions/README.md). Each repository is an independent project.

## Mandatory gates

Use the `node-change-workflow` skill for changes. Clarify requirements, inspect code,
plan impacts/tests/docs, then obtain explicit plan approval before editing. A reply
to questions is not approval. Unresolved auth, permissions, tenancy or data behavior
blocks implementation. Never assume "login" means email/password or JWT.
High-risk work needs an ADR and independent review. Re-approve material deviations.
Record the approver suggested by target-repository `git config user.name`, confirmed
by the person, and actual approval evidence. A Git name is not approval.

## Architecture

Use [capability modules](doc/standards/architecture.md), one primary type per file.
Separate interfaces, DTOs, schemas, models, mapping and implementations.
Routes -> authentication -> authorization -> validation -> controller -> business
service -> repository; resource/tenant policy checks occur in the use case as needed.
Only public contracts cross modules. Never leak Prisma models through the API.

## Required verification

Run the relevant checks from [setup](doc/development/setup.md), then the complete
quality gate before completion. Preserve existing behavior; no swallowed failures,
fake implementations, disabled tests or unexplained exceptions. Report unavailable
Docker/native-client checks as unverified, not passed.

Update affected `doc/` pages in the same change using `node-project-documentation`.
Use `node-docker-deployment` for container/proxy/deployment work; creating files does
not authorize a live deployment. Load specialized skills only when relevant.

Standards are a minimum bar. Conflicts with project rules or accepted ADRs require
clarification; do not silently override them. Instructions are not a security sandbox.
