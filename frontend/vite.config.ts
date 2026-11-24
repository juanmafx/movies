import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import { contentSecurityPolicyPlugin } from "./build/contentSecurityPolicy.ts";
import { resolveApiBaseUrl } from "./src/shared/config/apiBaseUrl.ts";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const apiOrigin = new URL(resolveApiBaseUrl(env.VITE_TVMAZE_API_URL)).origin;

  return {
    plugins: [react(), contentSecurityPolicyPlugin(apiOrigin)],
    build: { sourcemap: false, target: "es2022" },
    test: {
      coverage: {
        provider: "v8",
        include: ["src/**/*.{ts,tsx}", "build/**/*.ts"],
        exclude: ["src/main.tsx", "src/test/**", "src/**/*.test.{ts,tsx}", "src/vite-env.d.ts"],
        reporter: ["text"],
      },
      projects: [
        {
          extends: true,
          test: {
            name: "browser",
            environment: "jsdom",
            include: ["src/**/*.test.{ts,tsx}"],
            setupFiles: ["src/test/setup.ts"],
            restoreMocks: true,
          },
        },
        {
          extends: true,
          test: { name: "node", environment: "node", include: ["tests/**/*.test.ts"] },
        },
      ],
    },
  };
});
