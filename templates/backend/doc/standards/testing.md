# Testing

Run unit/HTTP contract checks with Vitest/Supertest and database integration tests
against disposable PostgreSQL. Mocks test boundaries; they do not prove SQL works.
Every business service has happy/failure/permission/validation tests.

Minimum coverage: 80% statements, branches, functions and lines. Explicit security,
ownership, query-limit, transaction and failure assertions are required regardless
of percentage. Only the thin process entrypoint is outside unit coverage; exercise
it in container tests. Do not exclude business code to improve the number.

Record the baseline and actual post-change command results. Existing failures are
reported separately, not silently fixed or ignored. Never delete or skip tests to
claim success. Add negative fixtures proving architecture/docs gates reject errors.
Container and native-client checks not run locally must remain explicitly unverified.
