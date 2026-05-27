import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  build: {
    outDir: "dist/spa", 
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client"),
    },
  },

  test: {
    globals: true,
    environment: "jsdom", 
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.{test,spec}.{js,ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "dist/", "**/*.d.ts", "**/*.config.*"],
    },
    server: {
      deps: {
        inline: ["vitest-canvas-mock"],
      },
    },
  }, 
});