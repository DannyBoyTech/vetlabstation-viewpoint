/// <reference types="vitest" />
import { defineConfig, loadEnv, splitVendorChunkPlugin } from "vite";
import svgr from "vite-plugin-svgr";
import react from "@vitejs/plugin-react";

const FALSY_ENV_VALS = ["false", "0", "no"];

function envBool(val) {
  return val != null && !FALSY_ENV_VALS.includes(val.trim().toLowerCase());
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const apiHost = env.VITE_IVLS_HOST || "127.0.0.1";
  const apiPort = env.VITE_IVLS_PORT || "3000";
  const apiHostPort = `${apiHost}:${apiPort}`;

  return {
    plugins: [react(), splitVendorChunkPlugin(), svgr()],
    define: {
      "import.meta.env.VP_NO_I18N": envBool(process.env["VP_NO_I18N"]),
    },
    test: {
      globals: true,
      environment: "jsdom",
      setupFiles: "./setupTests.ts",
      // See https://vitest.dev/guide/common-errors.html#failed-to-terminate-worker
      pool: "forks",
    },
    optimizeDeps: {
      include: ["@viewpoint/api"],
    },
    build: {
      commonjsOptions: {
        include: [/api\//, /node_modules/],
      },
      rollupOptions: {
        onwarn: (warning, warn) => {
          // See https://github.com/rollup/rollup/issues/4699
          if (warning.code === "MODULE_LEVEL_DIRECTIVE") {
            return;
          }
          warn(warning);
        },
      },
      sourcemap: true,
    },
    server: {
      host: "127.0.0.1",
      proxy: {
        "^/labstation-webapp/.*": {
          target: `http://${apiHostPort}`,
        },
        "/events": {
          target: `http://${apiHostPort}`,
        },
      },
    },
  };
});
