---
name: node-project-onboarding
description: "Use when creating or onboarding a backend project, interpreting generator answers, or deciding project/client and deployment boundaries."
---

# Project onboarding

1. Read `project.setup.json`, generated docs and existing ADRs. Verify this is the
   intended repository, not a sibling project.
2. Clarify business capabilities, served clients, identities/permissions, tenant
   requirements, data ownership, external integrations, load and SLOs.
3. Preserve mandatory Express/strict TypeScript/testing/documentation standards.
   Profiles are planning intentions, not implemented features.
4. Record confirmed answers and unresolved decisions in `doc/development/` using
   `doc/workflow/templates/requirement.md`. Do not collect secret values.
5. Confirm deployment host, data mode, TLS ownership and operational roles before
   production planning. File generation does not approve architecture or deployment.
6. Validate setup metadata and run documented Docker checks when available.

Output: project context, client/module map, approved decisions, blocking questions
and next approved task. Never copy a template author's approval into this project.
