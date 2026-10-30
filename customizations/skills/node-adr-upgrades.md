---
name: node-adr-upgrades
description: "Use for architecture decisions, named approvals, standards exceptions, template drift and reviewed generator/template upgrades."
---

# Decisions and upgrades

1. Read the accepted decision index and current template manifest. Identify the
   decision or release change; do not combine unrelated architectural choices.
2. Draft a Proposed ADR using `doc/workflow/templates/adr.md`, including alternatives,
   consequences, scope, tests, operational impact and related evidence.
3. Suggest `git config user.name`, confirm identity, obtain explicit approval of
   this revision, then record Accepted status/date/evidence. Git metadata is not proof.
4. Supersede accepted decisions instead of rewriting their original context.
5. For upgrades, use the CLI's read-only `--compare archive --project directory`.
   Review local/upstream conflicts, including project-owned docs and ADRs.
6. Apply only approved changes, run checks, and update the baseline in the same PR.
   Hash-bound standards exceptions require an accepted ADR and human review.

No automatic overwrites, remote publication, vulnerability acceptance or inherited
template-author approvals.
