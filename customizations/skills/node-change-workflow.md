---
name: node-change-workflow
description: "Use for any backend change, bug fix, refactor or dependency/configuration update. Clarifies requirements and gates implementation on explicit approval."
---

# Requirement-first changes

Read `AGENTS.md` and `doc/workflow/change-workflow.md`.

1. Identify project, ticket, risk and accepted decisions. Read actual callers/tests.
2. Resolve actors, inputs/outputs, permissions, data consistency, failure behavior,
   limits and acceptance criteria. Ask and stop on blockers; do not infer login method.
3. Use the requirement/plan templates under `doc/workflow/templates/`. Include
   affected documentation, tests, security, operations and rollback. Propose an ADR
   for architectural/high-risk decisions.
4. Obtain explicit approval of this revision. Confirm the Git-suggested approver;
   a configured name or a clarification answer is not approval.
5. Record baseline, implement approved scope, update docs, verify and review.
   Material deviations return to approval.
6. Report observed commands/results and independent review for high-risk changes.

Failure: keep the task blocked when requirements/approval/required checks are
missing. Do not fabricate success, suppress tests, or broaden scope silently.
