# Rollback

Before rollout record the prior API/migration image digests, configuration,
database version and validated backup/recovery point.

An application image rollback does not undo a database migration. Prefer compatible
expand/contract changes; assess whether the old application can operate on the new
schema. If not, stop traffic and follow an explicitly approved recovery/forward-fix
plan instead of blindly changing the image.

After rollback verify HTTPS, readiness, representative contracts and logs. Preserve
data volumes. Single-host Compose may have downtime and provides no automatic failover.
