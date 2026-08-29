import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@backend": path.resolve(__dirname, "../Backend/src")
    }
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      // Cloud n8n FoodLoop - Rescue Coordinator webhook
      "/api/n8n": {
        target: "https://kyawsanhtun.app.n8n.cloud",
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/n8n/, "")
      }
    }
  }
});
