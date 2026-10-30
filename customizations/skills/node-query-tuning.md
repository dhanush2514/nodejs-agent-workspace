---
name: node-query-tuning
description: "Use for slow PostgreSQL queries, N+1 problems, complex SQL, CTEs, window functions, aggregations and query-plan optimization."
---

# Query analysis

1. Obtain representative cardinality, predicates, ordering, concurrency and latency
   target. Confirm authorization/tenant predicates before optimizing.
2. Inspect generated SQL and query counts. Establish repeatable baseline plans and
   measurements using sanitized fixtures.
3. Consider selective projections, indexes, join/cardinality changes, keyset paging,
   CTEs/window functions or read models. Explain trade-offs and write overhead.
4. Parameterize raw SQL through Prisma tagged queries. Allowlist dynamic identifiers;
   never interpolate arbitrary column, order, table or filter text.
5. Use EXPLAIN safely. EXPLAIN ANALYZE executes queries: obtain explicit approval for
   production/mutations, or use disposable representative data.
6. Compare actual plans, rows/buffers/latency and correctness; document the result.

Failure: do not claim a query is efficient because it is shorter. Preserve tenant
isolation, consistent ordering and transaction semantics. Escalate schema changes
through the plan/ADR/migration workflow.
