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
    },
  },
  optimizeDeps: {
    exclude: ['@replit/vite-plugin-runtime-error-modal', '@replit/vite-plugin-cartographer'],
    include: ['lucide-react'],
    esbuildOptions: {
      // Força o bundling de todos os arquivos
      bundle: true,
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === "production",
        drop_debugger: process.env.NODE_ENV === "production",
      },
    },
    commonjsOptions: {
      // Força transformação de CommonJS para ES modules
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'ui': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-toast',
          ]
        },
      },
      // Tratamento especial para lucide-react
      plugins: [
        {
          name: 'lucide-react-resolver',
          resolveId(id) {
            if (id.includes('lucide-react') && id.includes('icons/')) {
              // Ignora imports de ícones individuais
              return { id: 'lucide-react', external: false };
            }
          }
        }
      ]
    },
  },
});