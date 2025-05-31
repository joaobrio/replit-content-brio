# INSTRUÇÕES PARA INTEGRAR A NOVA ROTA NO routes.ts

## PASSO 1: Adicionar o Import

No topo do arquivo `server/routes.ts`, logo após a linha:
```typescript
import { UploadService } from '../services/uploadService';
```

Adicione:
```typescript
// Import do TextExtractorService para extração de texto
import { TextExtractorService } from '../services/textExtractorService';
```

## PASSO 2: Adicionar a Nova Rota

Localize no arquivo a linha:
```
// ========== FIM DAS ROTAS CLOUDINARY ==========
```

ANTES desta linha, adicione a nova rota que está no arquivo `temp-unified-route.ts`.

A rota deve ficar assim na estrutura:
- ... outras rotas Cloudinary ...
- Nova rota `/api/mpmp/upload-e-processar` (código do temp-unified-route.ts)
- // ========== FIM DAS ROTAS CLOUDINARY ==========

## IMPORTANTE

1. Remova as primeiras linhas do arquivo temp-unified-route.ts:
   - A linha de import do TextExtractorService (já foi adicionada no topo)
   - Os comentários de instrução

2. Mantenha apenas o código da rota:
   ```typescript
   app.post('/api/mpmp/upload-e-processar', upload.single('arquivo'), async (req, res) => {
     // ... todo o código da rota ...
   });
   ```

## DEPOIS DE IMPLEMENTAR

1. Delete o arquivo temporário `temp-unified-route.ts`
2. Teste a nova rota com:
   ```bash
   curl -X POST http://localhost:5000/api/mpmp/upload-e-processar \
     -F "arquivo=@test.pdf" \
     -F "userId=test-user" \
     -F "projectName=Teste"
   ```

## VERIFICAÇÃO

A estrutura final deve ter:
- ✅ Import do TextExtractorService no topo
- ✅ Nova rota antes do comentário "FIM DAS ROTAS CLOUDINARY"
- ✅ Arquivo temp-unified-route.ts deletado
