# Verification and compatibility

## Local implementation evidence

Validated on Windows with a project-local Node.js 24.22.2 toolchain. Global npm
configuration, Git identity and the machine's installed Node version were not changed.

| Check                                                          | Observed result                   |
| -------------------------------------------------------------- | --------------------------------- |
| Generator type-check and unit/process tests                    | 34 tests passed                   |
| Generator coverage: statements / branches / functions / lines  | 90.24% / 86.01% / 95.23% / 93.10% |
| Backend type-check, lint and architecture                      | Passed                            |
| Backend unit/HTTP/contract/policy tests                        | 29 tests passed                   |
| Backend coverage: statements / branches / functions / lines    | 97.29% / 92.30% / 100% / 97.24%   |
| Backend compilation, OpenAPI freshness and documentation links | Passed                            |
| Generator and backend dependency audits                        | 0 reported vulnerabilities        |
| Native Node execution of deployment TLS helper                 | Passed                            |

The package test executes the real `npm exec --package=<archive>` command outside
the source checkout, including parent paths with spaces and Unicode. It checks
empty Git initialization, overwrite refusal, archive completeness, all 17 skills
and 5 agent projections per client, standards drift, and read-only archive
comparison. `npm run test:package -- --verify-backend` additionally installs,
checks and builds the freshly generated application.

The release procedure reruns this packaged verification before hand-off. No
package was published, no remote was configured and no live server was deployed.

### Environment-specific handling

- Public npm dependencies were accessed with command-scoped settings after the
  machine's pre-existing registry credentials returned E401.
- Prisma binary downloads used the existing system proxy/trusted certificate store,
  without disabling certificate validation.
- Windows watchers intermittently locked generated/coverage directories. Owned
  temporary cleanup uses bounded native retries; `COVERAGE_DIRECTORY` allows
  coverage reports outside the watched tree without changing tests or thresholds.
- The pinned Prisma engine's TLS options were checked against its public source.
  Unit tests reject libpq-only SSL mode strings and enforce Prisma's
  `sslmode=require&sslaccept=strict`. This is not a live database TLS handshake test.

### Outstanding external verification

Docker was unavailable, so real PostgreSQL integration, Nginx/TLS/container smoke,
image scanning, managed-database connectivity and Linux execution are **unverified**.
The relevant scripts and CI configuration are supplied, not represented as executed.
Live discovery/approval behavior in each AI client is also unverified.
The independent-review attempt could not access the workspace, so independent
review remains required before team rollout; no independent approval is claimed.

## Supported design

- Generator: Node.js 24 LTS, Git, Windows PowerShell/Command Prompt and Linux shells.
- Runtime: Linux containers, Docker Engine/Compose or Docker Desktop Linux containers.
- Standards: native entrypoints for Copilot VS Code/CLI, Claude Code and Cursor.

## Evidence policy

Do not equate static files with a tested native-agent workflow. Verify each client:

1. Open a freshly generated project in a new session.
2. Ask "implement login" without specifying a mechanism. Expect questions, no edits.
3. Invoke documentation and Docker skills by name and by matching natural-language requests.
4. Inspect discovery for duplicate names; native directories contain identical projections.
   If a client scans multiple directories, select the native projection or disable extra
   discovery locations in that client's supported settings. Do not silently rename skills.
5. Confirm read-only roles cannot edit and that changed scope triggers renewed approval.
6. Record client/version, pass/fail, evidence and limitations.

Claude/Cursor online references were unavailable during setup. Their standard native
file layouts are supplied, but live discovery/permissions are not certified by static
validation. Instructions guide behavior; protected CI and human review enforce merges.

The implementation machine has no Docker. Container execution, PostgreSQL integration,
Nginx/TLS behavior and Linux runner results must be recorded separately from local
Node tests. The CI and smoke scripts are executable verification, not claims they ran.

Coverage gates apply to runtime modules; only thin process entrypoints (`cli.ts` and
generated `bootstrap/server.ts`) are excluded from instrumented unit coverage. They
are exercised by packaged-process/container checks instead. No business module is
excluded to raise coverage.
