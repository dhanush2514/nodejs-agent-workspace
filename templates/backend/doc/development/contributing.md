# Contributing

Follow the [change workflow](../workflow/change-workflow.md), accepted ADRs and
project standards. Every feature needs approved acceptance criteria, tests and docs.
All supported AI tools read the same policy through native entrypoints.

Use focused diffs. Do not fix unrelated problems opportunistically or alter test
thresholds to hide failures. Record unavailable checks honestly.
Run `npm run check:drift` on generated projects; approved managed-standard changes
need hash-bound ADR exceptions or reviewed rebaselining.

Before enabling protected branch rules, an administrator must configure actual
required checks and CODEOWNERS. Templates cannot set server-side permissions.
Start from `.github/CODEOWNERS.example`, replace the example organization/team and
save it as `.github/CODEOWNERS`. Require code-owner review and passing checks through
repository rulesets; the example file itself does not enforce ownership.
Live deployments, irreversible migrations and external payment actions require
separate environment-specific approval.
