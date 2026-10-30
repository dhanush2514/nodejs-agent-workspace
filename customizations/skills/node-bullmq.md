---
name: node-bullmq
description: "Use for BullMQ background jobs, workers, retries, idempotency, scheduling, failed jobs and queue operations."
---

# BullMQ workers

1. Clarify job contract, business idempotency key, delivery semantics, ordering,
   concurrency, timeouts, retryable failures and retention.
2. Use a separate worker entrypoint/process and dedicated typed job DTOs. Treat
   delivery as at least once; persist idempotency for external side effects.
3. Decide producer/database consistency (outbox when required). Do not enqueue a
   job and claim atomicity with a separate database transaction.
4. Use role-appropriate Redis persistence and no eviction. Bound retries/backoff
   and failure retention; define operator replay approval and deduplication.
5. Handle shutdown/draining, stalled jobs, delayed schedules/timezones and poison jobs.
6. Test duplicate/retried/crashed/failed jobs and publish queue/runbook documentation.

Do not enable a dummy worker. Selecting the profile records intent; implement
actual jobs only from approved requirements. Never blindly replay payment jobs.
