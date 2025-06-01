#!/bin/bash
# Script de limpeza para remover arquivos de teste e cache antes do deploy

echo "🧹 Limpando ambiente para produção..."

# Remover pasta test se existir
if [ -d "test" ]; then
  echo "Removendo pasta test..."
  rm -rf test
fi

# Remover arquivos de teste
echo "Removendo arquivos de teste..."
find . -name "*.test.js" -type f -delete 2>/dev/null
find . -name "*.test.ts" -type f -delete 2>/dev/null
find . -name "*.spec.js" -type f -delete 2>/dev/null
find . -name "*.spec.ts" -type f -delete 2>/dev/null

# Limpar pasta dist
if [ -d "dist" ]; then
  echo "Limpando pasta dist..."
  rm -rf dist
fi

# Limpar cache do node_modules (arquivos de teste em cache)
echo "Limpando cache de módulos..."
find node_modules -name "test" -type d -prune -exec rm -rf {} \; 2>/dev/null
find node_modules -name "*test*" -type f -delete 2>/dev/null

# Limpar cache do TypeScript
if [ -d ".tsbuildinfo" ]; then
  rm -f .tsbuildinfo
fi

# Definir variáveis de ambiente
export NODE_ENV=production
export SKIP_TEST_FILES=true

echo "✅ Limpeza concluída!"
echo "🚀 Pronto para build de produção"
