import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
      // Resolvendo problema com d3-array
      "d3-array": path.resolve(import.meta.dirname, "node_modules/d3-array/dist/d3-array.js"),
    },
  },
  optimizeDeps: {
    include: ['d3-array'],
    exclude: ['@replit/vite-plugin-runtime-error-modal', '@replit/vite-plugin-cartographer'],
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: process.env.NODE_ENV !== "production",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: process.env.NODE_ENV === "production",
      },
    },
    rollupOptions: {
      external: [
        // Externalizando módulos problemáticos
        /lucide-react\/dist\/esm\/icons\/.*/,
      ],
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
          ],
          'icons': ['lucide-react'],
          'd3': ['d3-array'],
        },
      },
    },
  },
});
