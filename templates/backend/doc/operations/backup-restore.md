# Backup and restore

Decide retention, encryption, off-host storage, access controls and recovery point/
time objectives with the project owner. A Docker volume or same-host file is not
a disaster recovery strategy.

Managed database: confirm the provider's actual backup/PITR policy and permissions,
then exercise restore into a separate test instance. Do not assume it is enabled.

Self-hosted PostgreSQL: use version-compatible `pg_dump`/`pg_restore` or an approved
physical/PITR strategy. Authenticate securely, record schema/release versions,
verify backup integrity and restore into a disposable database before trusting it.
Do not run restore over the live database without explicit approval.

Redis persistence/eviction differs for cache versus queue/session state. Document
whether data is reconstructible and how failed jobs or sessions are recovered.
The optional Redis example uses AOF/noeviction, not a complete production backup plan.

Never use `docker compose down --volumes` as a deployment retry or rollback step.
