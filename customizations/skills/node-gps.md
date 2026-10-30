---
name: node-gps
description: "Use for GPS/location ingestion, fleet tracking, PostGIS, geofencing, device telemetry and location privacy."
---

# GPS and geospatial systems

1. Clarify devices/protocols, consent, authorized viewers, purpose, accuracy, sampling,
   retention, load, offline behavior and latency. Multiple apps do not imply shared
   access to location history.
2. Decide coordinate reference system, units, validation and timestamp semantics.
   Handle duplicates, late/out-of-order points, clock skew and implausible movement.
3. Choose PostGIS geometry/geography and indexes from distance/geofence semantics.
   Test boundary cases, antimeridian and unit conversion as applicable.
4. Separate ingestion, storage, policy and presentation. Choose REST/streaming transport
   only after requirements; do not assume WebSocket because data is location-based.
5. Test isolation, malformed data, ordering, geofence boundaries and retention deletion.
6. Document data flows, consent/revocation, recovery, telemetry and privacy safeguards.

No real user coordinates in examples, logs or fixtures. Do not build covert tracking
or invent legal/retention defaults.
