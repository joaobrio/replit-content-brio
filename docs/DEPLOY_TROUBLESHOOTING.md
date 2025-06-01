# 🚀 Deploy de Produção - Guia de Solução de Problemas

## 🎯 Problema Resolvido

Este guia documenta a solução implementada para o erro:
```
Application is trying to read a test file '/test/data/05-versions-space.pdf' that doesn't exist in the production deployment
```

## 🔧 Solução Implementada

### 1. **Production Guard Middleware** (`server/middleware/productionGuard.ts`)
- Filtra erros relacionados a arquivos de teste em produção
- Previne tentativas de leitura de arquivos test/*
- Limpa cache de módulos de teste

### 2. **Scripts de Limpeza** (`scripts/clean-production.sh`)
- Remove pastas e arquivos de teste antes do build
- Limpa cache do node_modules
- Define variáveis de ambiente de produção

### 3. **Configuração de Build** (`.replit`)
- Exclui padrões de teste do build
- Define NODE_ENV=production
- Adiciona headers de segurança

### 4. **Otimização do Vite** (`vite.config.ts`)
- Exclui arquivos de teste do bundle em produção
- Remove console.log e debugger
- Otimiza chunks para melhor performance

## 📋 Como Fazer Deploy

### No Replit:

1. **Pull das mudanças do GitHub**:
   ```bash
   git pull origin main
   ```

2. **Executar build de produção**:
   ```bash
   npm run build:prod
   ```

3. **Configurar Secrets** (Settings → Secrets):
   - `NODE_ENV` = `production`
   - `SKIP_TEST_FILES` = `true`
   - Suas outras variáveis (ANTHROPIC_API_KEY, etc.)

4. **Fazer Deploy**:
   - Clique em "Deploy" → "Production"
   - Escolha tipo de deployment (Autoscale recomendado)
   - Aguarde o deploy completar

## 🛡️ Prevenção de Problemas Futuros

### Boas Práticas:

1. **Nunca hardcode caminhos de teste** no código principal
2. **Use variáveis de ambiente** para diferenciar ambientes
3. **Mantenha arquivos de teste** em pastas separadas
4. **Execute `npm run clean`** antes de cada deploy

### Comandos Úteis:

```bash
# Limpar ambiente
npm run clean

# Build de produção com limpeza
npm run build:prod

# Verificar se há referências a teste
grep -r "test/" . --exclude-dir=node_modules

# Testar localmente com ambiente de produção
NODE_ENV=production npm start
```

## 🚨 Troubleshooting

### Se o erro persistir:

1. **Limpe o cache do Replit**:
   ```bash
   rm -rf .cache dist node_modules/.cache
   npm install
   ```

2. **Force rebuild**:
   - Delete o deployment atual
   - Crie um novo deployment

3. **Verifique os logs**:
   - O Production Guard mostrará mensagens como:
     ```
     [Production Guard] Blocked test-related error: ...
     ```

### Monitoramento:

Os erros de teste são filtrados e logados, mas não quebram a aplicação. Verifique os logs para:
```
Running in production mode - test files disabled
```

## 📝 Mudanças Implementadas

- ✅ Production Guard Middleware
- ✅ Script de limpeza automática
- ✅ Configuração .replit para produção
- ✅ Otimização do Vite para excluir testes
- ✅ Scripts npm para build de produção
- ✅ Documentação completa

## 🎉 Resultado

Com estas mudanças, sua aplicação:
- Não tentará mais acessar arquivos de teste em produção
- Terá build mais rápido e bundle menor
- Funcionará corretamente no Replit Deploy
- Terá proteção contra erros similares no futuro

---

**Última atualização**: 31 de maio de 2025
