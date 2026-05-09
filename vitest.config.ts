import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    globals: true,
    // @ts-expect-error environmentMatchGlobs is valid at runtime but missing from vitest 4.x types
    environmentMatchGlobs: [
      ["**/*-actions.test.ts", "node"],
      ["**/*.integration.test.ts", "node"],
    ],
    exclude: ["**/node_modules/**", "**/dist/**", "tests/e2e/**"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(__dirname, "./src/tests/__mocks__/server-only.ts"),
    },
  },
});
