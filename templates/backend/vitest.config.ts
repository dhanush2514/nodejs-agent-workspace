import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 30000,
    include: ["tests/unit/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: process.env.COVERAGE_DIRECTORY ?? "coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/bootstrap/server.ts"],
      thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 }
    }
  }
});
