import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    testTimeout: 120000,
    hookTimeout: 60000,
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      reportsDirectory: process.env.COVERAGE_DIRECTORY ?? "coverage",
      include: ["src/**/*.ts"],
      exclude: ["src/cli.ts"],
      thresholds: { lines: 80, statements: 80, functions: 80, branches: 80 }
    }
  }
});
