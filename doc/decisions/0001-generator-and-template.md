# ADR 0001: Internal generator and independent Docker-first backends

- Status: Accepted
- Approved by: Dhanush
- Approval evidence: explicit "Plan Approved, Implement it" instruction and confirmed approver name in this implementation session.
- Approval date: 2026-10-30
- Risk: High - new architecture, tooling and deployment configuration.
- Scope: this generator repository, not applications generated from it.

## Context and decision

Teams need consistent requirement-first development across Copilot, Claude and Cursor.
Bundle one canonical Express/TypeScript template in a versioned internal npm archive.
Generate independent repositories with Docker/Nginx, project-owned documentation and
ADRs. Do not select authentication or invent business requirements.

## Alternatives

Manual clones lose guided setup. A hosted private registry adds billing and access
dependencies. A universal shared backend violates project isolation.

## Consequences

The generator needs Node/npm/Git; application deployment needs Docker, not host Node.
Updates are explicit reviewed changes. Client-native approval controls differ.
Docker is unavailable on the implementation machine: Dhanush approved implementing
the configurations and CI tests while reporting container validation as unverified.
This record and its approval are not bundled into generated applications.
