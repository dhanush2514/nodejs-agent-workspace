import { describe, expect, it } from "vitest";
// JavaScript checker is intentionally executable without a TypeScript build.
import { inspectSource } from "../../scripts/architecture.mjs";
describe("architecture rejection fixtures", () => {
  it("rejects mixed responsibilities", () => {
    expect(
      inspectSource("src/modules/a/services/a.ts", "interface A {} class B {}").length,
    ).toBeGreaterThan(0);
  });
  it("rejects repository imports across modules", () => {
    expect(
      inspectSource("src/modules/a/services/a.ts", "import { B } from '../../b/repositories/b.js';")
        .length,
    ).toBeGreaterThan(0);
  });
  it("rejects undocumented direct endpoint registration", () => {
    expect(
      inspectSource("src/bootstrap/a.ts", "app.get('/hidden', handler);").length,
    ).toBeGreaterThan(0);
  });
  it("permits narrow public contracts", () => {
    expect(
      inspectSource("src/modules/a/services/a.ts", "import type { B } from '../../b/public/b.js';"),
    ).toEqual([]);
  });
});
