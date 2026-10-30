---
name: node-docker-deployment
description: "Use for Docker builds, Compose development/production setup, Nginx reverse proxy, TLS certificates, migrations, deployment checks, troubleshooting and rollback."
---

# Docker and Nginx deployment

1. Read `doc/operations/deployment.md` and accepted deployment ADRs. Clarify host,
   domain, image/digest, data hosting, certificates/secrets, resource limits and
   backup/recovery responsibilities. Never assume a live target.
2. Select explicit development/production and self-hosted/external Compose files.
   No development override, credentials or code mounts in production.
3. Validate prerequisites, port conflicts, proxy trust, mounted certificates,
   image compatibility and `docker compose config --quiet`; run `nginx -t`.
4. Build/test images and propose migration, backup, rollout and rollback steps.
   Production images are immutable, application runs non-root, data ports stay private.
5. Require explicit environment-specific approval before live actions. Execute
   controlled migrations once; do not delete volumes or blindly retry failures.
6. Verify real responses through HTTPS Nginx, readiness/liveness and logs. Check
   forwarded-header behavior, API replacement and graceful shutdown as relevant.
7. Update deployment/TLS/backup/rollback runbooks; report evidence and unverified checks.

Externally provisioned certificates need validated renewal/reload. Single-host Compose
is not HA. Shared-edge multi-project routing and automatic ACME are out of baseline.
