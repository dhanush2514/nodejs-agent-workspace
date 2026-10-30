---
name: node-observability
description: "Use for Pino logging, OpenTelemetry traces/metrics, SigNoz, Grafana/Loki, dashboards, alerts and operational telemetry."
---

# Observability

1. Clarify SLOs, environments, telemetry destinations, credentials, sampling,
   retention, cost limits and sensitive-data restrictions.
2. Use structured safe logs and request/trace correlation. Keep credentials,
   bodies, location histories and high-cardinality IDs out of labels.
3. Configure OpenTelemetry exporters explicitly. The starter provides optional OTLP
   tracing; it does not claim complete metrics/log export or vendor dashboards.
4. For SigNoz validate OTLP endpoints and collector settings. For Grafana/Loki
   separately decide the metrics and tracing backends; Loki is for logs.
5. Test exporter outages, shutdown flush, correlation and redaction. Observability
   failures must not silently expose secrets or exhaust memory.
6. Document dashboards, alerts, runbooks and remaining instrumentation gaps.

Do not enable a vendor or send project telemetry to an external system without
approved configuration and data-handling decisions.
