import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "lucide-react"],
          "vendor-graph": [
            "sigma",
            "graphology",
            "graphology-layout-forceatlas2",
          ],
          "vendor-validation": ["zod"],
        },
      },
    },
  },
});
