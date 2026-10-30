# TypeScript

Strict ESM TypeScript, explicit type imports and Node-compatible `.js` import paths.
Do not use `any`, unsafe double casts, ignored promises or non-null assertions to
silence design problems. Validate untrusted values at the boundary with Zod.

DTOs are plain data and live separately from schemas and implementation classes.
Infer DTO types from their schema where useful; do not duplicate shape definitions.
Use domain models for internal behavior and dedicated mapping to public DTOs.

Prefer readable names and small cohesive functions. Comment non-obvious intent,
not every line. No dead code, commented-out implementations or empty stubs.
Format with Prettier; lint and type-check before completion.
