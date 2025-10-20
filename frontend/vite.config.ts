import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

const API_BASE_URL = process.env.VITE_API_BASE_URL || "http://localhost:5000";

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    port: 3000,
    host: true,
    proxy: {
      "/api": {
        target: API_BASE_URL,
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    target: "esnext",
    outDir: "dist",
    sourcemap: true
  }
});
