# Operations

Docker-first, single-project Compose behind Nginx. Use immutable application images,
non-root application runtime, private data networks, graceful shutdown, readiness
and liveness. Health checks are not a high-availability guarantee.

Production requires explicit host/domain/data/TLS/secret decisions. No automatic
certificate issuance, shared-edge multi-project routing or live deployment.
Nginx overwrites forwarded headers; Express trusts only the configured proxy network.
Never expose application/database/debug ports by default.

Define timeouts, retry budgets, SLOs, queue/caching policies and recovery objectives
per project. OpenTelemetry is vendor-neutral. SigNoz and Grafana/Loki integrations
need approved endpoints and retention; Loki alone does not provide metrics/traces.
Track log volume, error rate, latency, saturation and database/queue health without
high-cardinality or sensitive labels.
