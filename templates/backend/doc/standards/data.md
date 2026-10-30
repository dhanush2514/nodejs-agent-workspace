# Data and persistence

Prisma/PostgreSQL are the baseline. Repositories own access and return domain
models. Select only required data, bound results and avoid N+1 queries.
Use parameterized SQL for complex CTE/window/aggregation queries; never concatenate
untrusted strings or use unsafe raw query APIs.

Choose indexes from real access patterns and query plans. Run `EXPLAIN` safely;
`EXPLAIN ANALYZE` executes the query and needs approval for mutations/production.
Measure latency and rows scanned rather than claiming optimization from style.

Transactions protect invariants, not just groups of calls. Decide isolation,
locking, conflict/retry policy, and idempotency from requirements. External calls
inside transactions require explicit justification. Use an outbox where durable
database/event consistency is needed.

Migrations are reviewed and applied once per release. Prefer expand/contract;
document data backfills and rollback constraints. Test against real PostgreSQL,
including failed transactions and concurrent operations where applicable.

The template overrides Prisma's configuration-only `deepmerge-ts` dependency to
8.0.2 to address its upstream recursion advisory. Validate Prisma generation,
schema validation and migrations when upgrading/removing this override. Do not
silently downgrade Prisma or suppress the dependency scanner.

External PostgreSQL requires the pinned Prisma engine's supported
`sslmode=require&sslaccept=strict` settings. libpq's `verify-full`/`verify-ca` strings
are not interchangeable with Prisma connection options. Validate provider CA
mounts and the actual TLS connection before production use.
