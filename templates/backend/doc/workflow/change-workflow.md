# Requirement-first change workflow

1. **Classify:** Low for non-behavioral docs/tests; Medium for local behavior;
   High for auth, public contracts, new dependencies/integrations, migrations,
   deployment, cross-module redesign or standards exceptions. Escalate when uncertain.
2. **Clarify:** read setup records and accepted ADRs. Ask about missing actors,
   inputs/outputs, permissions, data, failure behavior, limits and acceptance criteria.
   Stop if a necessary answer is missing. Do not infer login method or tenant model.
3. **Analyze/plan:** inspect callers, implementation, tests and docs. Propose files,
   relevant standards, security/operational impact, tests and rollback. Low changes
   can use a short plan; behavior changes need the full template.
4. **Approve:** explicit approval of the specific plan; high-risk and architectural
   decisions need an ADR. Suggest the name from `git config user.name`, confirm it,
   and record evidence/date. Never auto-approve from Git identity or silence.
5. **Implement:** record baseline results, then change approved scope only.
   Material deviations return to planning/approval. Update docs in the same change.
6. **Verify:** build/type/lint, targeted tests then the quality gate, architecture,
   docs/contracts and relevant container/database/security checks.
7. **Review/report:** independent review for High; report actual evidence,
   unverified checks and deployment prerequisites. Missing required docs block done.

Accepted ADRs live in `doc/decisions/NNNN-title.md` with an index. They are historical:
supersede rather than rewrite the decision. Proposed ADRs have no approval identity.
Backfills require evidence and explicit approval; do not fabricate historical dates.

Protect policy files with real CODEOWNERS and required branch checks in repository
settings. AI instructions and editable metadata are not tamper-proof controls.
