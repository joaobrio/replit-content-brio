const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🔧 Iniciando build com correções para d3-array...\n');

// Limpa a pasta dist
if (fs.existsSync('dist')) {
  fs.rmSync('dist', { recursive: true, force: true });
}

// Define variáveis de ambiente
process.env.NODE_ENV = 'production';

try {
  // 1. Build do cliente com configuração especial
  console.log('📦 Building client...');
  
  // Cria um vite.config temporário que resolve o problema
  const viteConfigTemp = `
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve("./client/src"),
      "@shared": path.resolve("./shared"),
      "@assets": path.resolve("./attached_assets"),
      // Força o uso da versão em dist do d3-array
      "d3-array": path.resolve("./node_modules/d3-array/dist/d3-array.js"),
    },
  },
  optimizeDeps: {
    include: ['d3-array', 'd3-scale', 'd3-time', 'recharts'],
    exclude: ['@replit/vite-plugin-runtime-error-modal', '@replit/vite-plugin-cartographer'],
  },
  root: "./client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    sourcemap: false,
    minify: "terser",
    rollupOptions: {
      external: [/lucide-react\\/dist\\/esm\\/icons\\/.*/],
      output: {
        manualChunks: {
          'vendor': ['react', 'react-dom'],
          'charts': ['recharts', 'd3-array', 'd3-scale', 'd3-time'],
        },
      },
    },
  },
});
`;

  // Salva temporariamente
  fs.writeFileSync('vite.config.temp.js', viteConfigTemp);
  
  // Executa o build do Vite com a config temporária
  execSync('npx vite build --config vite.config.temp.js', { stdio: 'inherit' });
  
  // Remove config temporária
  fs.unlinkSync('vite.config.temp.js');
  
  console.log('✅ Client build completed!\n');

  // 2. Build do servidor
  console.log('🚀 Building server...');
  execSync('npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist', { 
    stdio: 'inherit' 
  });
  
  console.log('✅ Server build completed!\n');
  
  console.log('🎉 Build completed successfully!');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
} 