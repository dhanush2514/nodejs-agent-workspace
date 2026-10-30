---
name: node-build-test
description: "Use for baseline or verification builds, TypeScript checks, lint, Vitest coverage, PostgreSQL integration tests and Docker validation."
---

# Build/test

1. Read package scripts and `doc/development/setup.md`; use this project's commands.
2. Record baseline status before changes. Run the smallest relevant test selection,
   then the full quality gate before completion.
3. Docker-first: build the `test` image target; use disposable PostgreSQL for
   `npm run test:integration`. Unit mocks do not prove SQL compatibility.
4. Run type/build/lint, architecture, contract/docs and drift checks. Require 80%
   statements/branches/functions/lines and explicit permission/failure tests.
5. Inspect actual output. Separate existing failures, new failures and checks not run.
6. Stop owned test resources without deleting real project volumes.

Failure: missing Docker is an unverified integration check, not a pass. Never lower
coverage, skip a test, swallow runner errors or rerun a still-running command blindly.
Output command, exit code, test/coverage evidence and remaining blockers.
