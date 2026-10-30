# Notes sample system

Purpose: demonstrate a typed, separated endpoint-to-database implementation.
Validation produces request DTOs; controllers delegate to `NoteService`;
`NoteRepository` abstracts storage; `PrismaNoteRepository` creates/selects notes.
The mapper converts domain dates into explicit response DTO ISO timestamps.

PostgreSQL owns UUID keys, bounded titles and creation timestamps. A list query
orders UUIDs and fetches at most limit + 1 rows to compute a continuation cursor.
There is no cache or external side effect. Individual operations are atomic.

Failures are sanitized at the HTTP boundary; readiness reports unavailable storage.
Optional OTLP tracing includes a sample create span; this is not full instrumentation.
Unit/HTTP tests verify auth, validation, paging and failures. Integration tests need
a disposable migrated PostgreSQL instance and verify persistence/rollback.

The default server refuses protected access until production identity is designed.
