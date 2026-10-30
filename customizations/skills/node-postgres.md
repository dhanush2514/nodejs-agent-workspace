---
name: node-postgres
description: "Use for PostgreSQL and Prisma models, repositories, migrations, indexes, transactions and database connection management."
---

# PostgreSQL/Prisma

1. Clarify data invariants, ownership, retention, expected volume and access patterns.
   Read `doc/standards/data.md` and existing migrations before changing schema.
2. Model nullability, constraints, keys and indexes deliberately. Keep Prisma types
   inside persistence; return domain models and map explicit API DTOs.
3. Put parameterized queries in repositories. Bound reads and avoid N+1 behavior.
4. Choose transaction isolation and concurrency policy from the invariant; avoid
   network calls inside transactions. Use outbox/inbox patterns where required.
5. Create reviewed expand/contract migrations and backfill/recovery plans. Apply
   migrations once per release, never simultaneously in every API replica.
6. Test against real disposable PostgreSQL: constraints, rollback, pagination and
   concurrency where applicable. Document schema and deployment consequences.

Failure: do not run destructive migrations on live data, use unsafe SQL APIs,
silently disable TLS, or replace a missing integration test with a mock assertion.

## Learnings

The pinned Prisma 6 engine does not accept libpq's `sslmode=verify-full` and can
fall back to `prefer`; use `sslmode=require&sslaccept=strict`, with a mounted
provider certificate when needed. Check the actual driver's TLS options rather
than assuming another PostgreSQL client's syntax, and do not treat a failed TCP
connection as proof of certificate verification. See `doc/standards/data.md`
and verify a real TLS handshake before production use.
