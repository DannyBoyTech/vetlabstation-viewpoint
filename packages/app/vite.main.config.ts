import { defineConfig } from "vite";

// https://vitejs.dev/config
export default defineConfig({
  optimizeDeps: {
    include: ["@viewpoint/api"],
  },
  build: {
    commonjsOptions: {
      include: [/api\//, /node_modules/],
    },
    sourcemap: true,
  },
  resolve: {
    // Some libs that can run in both Web and Node.js, such as `axios`, we need to tell Vite to build them in Node.js.
    // @ts-ignore (deprecated in current vite but the vite forge plugin uses an older version)
    browserField: false,
    mainFields: ["module", "jsnext:main", "jsnext"],
  },
});
