---
name: node-redis
description: "Use for Redis caching, TTL/invalidation, key design, cache stampedes, consistency and Redis outage behavior."
---

# Redis caching

1. Clarify whether Redis is cache, session store, lock or queue infrastructure.
   Ask for freshness, outage behavior, retention and sensitive-data constraints.
2. Design versioned tenant-aware keys, bounded values, TTL and invalidation events.
   Do not cache authorization decisions without explicit revocation semantics.
3. For cache-aside, prevent stampedes with bounded coordination/jitter where needed.
   Decide whether cache outages fail open to the database or fail closed by use case;
   never silently treat an unavailable session/auth store as authenticated.
4. Configure connection/timeouts/retry budgets, memory and eviction for the role.
   A queue store must not inherit cache eviction settings.
5. Test miss/hit/stale/invalidation/outage/concurrency behavior using disposable Redis.
6. Document consistency guarantees, metrics and recovery under `doc/systems/`.

The provided Redis Compose overlay is isolated infrastructure, not an implemented
application cache. Add client dependencies only after an approved design.
