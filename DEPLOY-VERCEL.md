# Deploy BRIO Content na Vercel - Guia Rápido

## 🚀 Deploy em 10 minutos

### 1. Conectar GitHub na Vercel (2 min)
1. Acesse [vercel.com](https://vercel.com)
2. Clique em "Sign Up" → "Continue with GitHub"
3. Autorize o acesso

### 2. Importar Projeto (3 min)
1. No dashboard Vercel, clique "Add New..." → "Project"
2. Selecione o repositório `replit-content-brio`
3. Escolha o branch `vercel-deploy`
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm install --force && npm run build`
   - **Output Directory**: `dist`

### 3. Configurar Variáveis de Ambiente (5 min)

#### Banco de Dados (Escolha 1)
**Opção A - Supabase (Recomendado)**
1. Crie conta em [supabase.com](https://supabase.com)
2. "New Project" → Copie a connection string
3. Adicione na Vercel: `DATABASE_URL=sua_connection_string?sslmode=require`

**Opção B - Neon**
1. Crie conta em [neon.tech](https://neon.tech)
2. Crie database → Copie connection string
3. Adicione na Vercel: `DATABASE_URL=sua_connection_string`

#### APIs Obrigatórias
```
ANTHROPIC_API_KEY=sk-ant-...
SESSION_SECRET=qualquer-string-aleatoria-segura
NODE_ENV=production
VERCEL=1
```

#### APIs Opcionais
```
OPENAI_API_KEY=sk-...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

### 4. Deploy! 🎉
1. Clique "Deploy"
2. Aguarde ~2-3 minutos
3. Acesse sua URL: `https://seu-projeto.vercel.app`

## ⚡ Comandos Úteis

```bash
# Ver logs
vercel logs

# Redeploy manual
vercel --prod

# Adicionar variável de ambiente
vercel env add

# Ver todas as variáveis
vercel env ls
```

## 🆘 Troubleshooting

### Build falhou?
- Verifique se todas as variáveis de ambiente estão configuradas
- Tente: `npm install --force` no build command

### API não responde?
- Verifique os logs: `vercel logs`
- Confirme que `DATABASE_URL` está correto

### Erro de CORS?
- Adicione `FRONTEND_URL=https://seu-app.vercel.app` nas variáveis

## 📱 Próximos Passos

1. **Domínio customizado**: Settings → Domains
2. **Analytics**: Já incluído gratuitamente
3. **Monitoramento**: Settings → Functions → Logs

---

**Dúvidas?** Abra uma issue no GitHub.
