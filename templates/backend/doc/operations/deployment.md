# Standalone deployment

One project stack per compatible Linux Docker host/address. Nginx alone binds
80/443. Shared-edge multi-project routing, Kubernetes, automatic ACME and HA are
not part of this baseline. Check existing services/networks before deployment.

## Required decisions

Approve host, domain/DNS, firewall, image registry/source, immutable API and matching
migration image digests, sizing, secrets, TLS ownership, data hosting and recovery.
Set `project.setup.json` dataHosting to `self-hosted` or `external` explicitly.
This metadata is not human approval; keep actual approval in the ADR/PR record.

Build `runtime` and `migration` image targets, test them, and distribute through
your approved image channel. Registry publication is not performed by this template.

Supply environment variables through the deployment operator's secure mechanism:
`APP_IMAGE`, `MIGRATION_IMAGE` (digest references), `SERVER_NAME`,
`APPLICATION_SUBNET`, `DATABASE_URL_FILE`, `TLS_CERT_FILE`, `TLS_KEY_FILE`.
Mount paths must exist; never commit their contents. Self-hosting also requires
`POSTGRES_USER`, `POSTGRES_DB`, `POSTGRES_PASSWORD_FILE`.
`API_MEMORY`, `API_CPUS`, `POSTGRES_MEMORY` have conservative example defaults and
must be sized from measurements.

## Validate and deploy after approval

Run `npm run deploy:preflight` from a Node.js 24 operator environment. The script
validates inputs/certificate/key and Docker config, not deployment approval.
It can also run from an approved maintenance container with required tooling and
mounts; do not expose the Docker socket to the application container.
For updates use `--existing-stack` only after confirming existing port ownership.

External data:

```sh
docker compose -f compose.yaml -f compose.production.yaml -f deploy/compose/external-data.yaml config --quiet
docker compose -f compose.yaml -f compose.production.yaml -f deploy/compose/external-data.yaml run --rm migrate
docker compose -f compose.yaml -f compose.production.yaml -f deploy/compose/external-data.yaml up -d --no-build --wait
```

For self-hosting replace the external overlay with both
`deploy/compose/self-hosted-data.yaml` and `deploy/compose/self-hosted-production.yaml`.
Never include `compose.development.yaml` in production.
Database connection credentials must match the configured self-hosted database.
External databases require verified TLS and appropriate provider certificates.
For the pinned Prisma engine use `sslmode=require&sslaccept=strict` in the secret
connection URL. Do not substitute libpq's `verify-full`/`verify-ca`: this engine
does not recognize those modes and can fall back to `prefer`. Runtime configuration,
migrations and preflight enforce the Prisma-specific settings.

If the provider needs a custom certificate, add
`sslcert=/run/secrets/database-ca` to the URL, set `DATABASE_CA_FILE` to the approved
certificate file, and include `-f deploy/compose/database-ca.yaml` in every production
command. Both the API and migration service receive the read-only certificate.
Without that option, strict verification uses the runtime's trusted certificate store.

Validate rendered Nginx config with `docker compose ... run --rm --no-deps nginx nginx -t`
(replace `...` with the exact selected files). Confirm HTTPS health and a representative
approved API request after rollout. Migration failure blocks promotion; do not
repeatedly restart the stack to hide it.

Nginx uses Docker DNS re-resolution when the API container changes. Only the trusted
application subnet may influence Express proxy-derived identity. Do not attach
untrusted containers to that network.

The deployment host needs Docker, not host Node: the optional JavaScript preflight
can run on the operator workstation against its prepared config. Repeat host port,
file-permission and network checks on the actual server before applying anything.
