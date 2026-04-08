import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const localBackend = "http://localhost:8005";

/** Do not proxy React Router paths that sit under the same prefix as legacy `/doctor` APIs. */
const doctorProxy = {
  target: localBackend,
  changeOrigin: true,
  bypass(req) {
    const pathname = (req.url || "").split("?")[0] || "";
    if (
      req.method === "GET" &&
      /^\/doctor\/(login|register|dashboard|profile)\/?$/.test(pathname)
    ) {
      return "/index.html";
    }
  },
};

const devProxy = {
  "/api": { target: localBackend, changeOrigin: true },
  "/uploads": { target: localBackend, changeOrigin: true },
  "/appointment": { target: localBackend, changeOrigin: true },
  "/doctor": doctorProxy,
  "/users": { target: localBackend, changeOrigin: true },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  assetsInclude: ["**/*.svg", "**/*.csv"],
  server: { proxy: devProxy },
  preview: { proxy: devProxy },
});
