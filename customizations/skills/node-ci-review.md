---
name: node-ci-review
description: "Use for GitHub Actions CI, pull-request review, failing checks, dependency scans and independent backend standards review."
---

# CI and review

1. Determine the approved scope and baseline; read callers, tests, contracts and ADRs.
2. Review correctness, permissions/ownership, transactions, error paths, resource
   limits, module boundaries and docs. Cite verified file/line evidence.
3. Execute existing checks in disposable infrastructure. Keep secrets out of fork
   PR jobs; never use untrusted PR code with privileged deployment credentials.
4. Pin dependencies/images/actions appropriately and inspect scan findings rather
   than blindly running force upgrades. Failed scans remain failures.
5. Require independent high-risk review. Confirm real CODEOWNERS/branch protection
   is configured by administrators; local policy files do not enforce server rules.
6. Return ranked findings, impact, tests and fixes; separate pre-existing issues.

Use `doc/workflow/templates/completion.md`. Do not publish, approve your own human
review, mutate unrelated code, or claim a clean review without examining evidence.
