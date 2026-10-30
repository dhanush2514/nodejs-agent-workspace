---
name: node-rust
description: "Use for Rust workers/services alongside a Node backend, FFI/native module decisions, protocol contracts and performance offloading."
---

# Rust integration

1. Establish a measured CPU/latency/safety need and ownership boundary. Do not add a
   second language simply because a profile was selected.
2. Default to an independently testable service/worker contract. Native bindings
   require an ADR covering ABI, supported architectures, memory and deployment risks.
3. Define versioned request/event DTOs, validation, timeouts, idempotency and failure
   semantics across the language boundary.
4. Keep business rules owned by one module; avoid duplicate Node/Rust implementations.
5. Use cargo fmt/clippy/test and dependency checks when a Rust project exists, plus
   cross-language contract tests and the actual target container architecture.
6. Document build/runtime dependencies, operational behavior and rollback.

Failure: never ship a native binary tested on only one host as universal. Do not
silently use FFI or create placeholder Rust code without an approved use case.
