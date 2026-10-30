---
name: node-project-documentation
description: "Use when adding/changing APIs or systems, explaining authentication or architecture, writing developer guides/runbooks, or documenting completed backend work."
---

# Project documentation

1. Read requirements, accepted ADRs, implementation, endpoint metadata and tests.
   Separate implemented behavior, proposed behavior and unresolved decisions.
2. Identify affected `doc/` pages. Use templates in `doc/workflow/templates/`.
   Ask about missing facts; never invent behavior to fill a page.
3. API pages include method/path/purpose, auth, authorization, parameters/limits,
   safe request/response examples, errors, side effects and versioning.
4. System pages explain boundaries, components, flows/state, data ownership,
   policies, failures/retries, configuration, telemetry and troubleshooting.
5. Generate OpenAPI from canonical schemas; run `npm run check:docs`. Update the
   index and relative links. Review narrative accuracy against actual code.
6. Report changed pages, checks and gaps. Feature completion requires same-change docs.

Use only synthetic examples; no secrets, real payment details, user/location data
or private incident payloads. Do not imply a pending authentication mechanism exists.
