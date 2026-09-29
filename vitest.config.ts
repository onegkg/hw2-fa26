import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 30000,
    // Route tests share one database file, so test files run one at a time.
    env: { DB_FILE: "test.sqlite" },
    fileParallelism: false,
  },
});
