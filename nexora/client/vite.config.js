import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 700,
    cssCodeSplit: true,
    minify: "esbuild",
    target: "es2020",
    sourcemap: false,
    reportCompressedSize: false,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("react-dom") || id.includes("/react/")) {
              return "vendor-react";
            }
            if (id.includes("lucide-react")) {
              return "vendor-icons";
            }
            if (id.includes("@capacitor/")) {
              return "vendor-capacitor";
            }
            return "vendor";
          }
        },
      },
    },
  },
  server: {
    port: 5173,
  },
});
