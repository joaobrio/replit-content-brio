# Instruções para Implementar a Rota Unificada

## 📋 Passos para Adicionar a Rota `/api/mpmp/upload-e-processar`

### 1. Adicionar Import no Topo do `server/routes.ts`

Após a linha 10 onde está:
```typescript
import { UploadService } from '../services/uploadService';
```

Adicione:
```typescript
import { TextExtractorService } from '../services/textExtractorService';
```

### 2. Adicionar a Nova Rota

Localize a linha 1708 (após `// ========== FIM DAS ROTAS CLOUDINARY ==========`) e adicione ANTES dessa linha:

```typescript
  // ========== ROTA UNIFICADA: UPLOAD + PROCESSAMENTO ==========
  
  // Nova rota que unifica upload para Cloudinary + extração de texto + processamento com IA
  app.post('/api/mpmp/upload-e-processar', upload.single('arquivo'), async (req, res) => {
    let uploadedFileId: string | null = null;
    let filePath: string | null = null;

    try {
      // Validações iniciais
      if (!req.file) {
        return res.status(400).json({ 
          success: false, 
          message: 'Nenhum arquivo foi enviado' 
        });
      }

      filePath = req.file.path;
      const userId = req.body.userId || 'demo-user';
      const projectName = req.body.projectName || req.file.originalname.split('.')[0];

      console.log(`🚀 Iniciando processamento unificado: ${req.file.originalname}`);

      // PASSO 1: Upload para Cloudinary
      console.log('📤 Passo 1/4: Fazendo upload para Cloudinary...');
      const fileBuffer = await fs.readFile(filePath);
      
      const uploadResult = await UploadService.uploadFile(fileBuffer, {
        userId,
        fileName: req.file.originalname,
        projectName,
        tags: ['mpmp', 'auto-process', userId]
      });

      uploadedFileId = uploadResult.fileId;
      console.log('✅ Upload concluído:', uploadResult.url);

      // PASSO 2: Extrair texto do arquivo
      console.log('📄 Passo 2/4: Extraindo texto do documento...');
      const extractionResult = await TextExtractorService.extractTextFromFile(
        fileBuffer,
        req.file.mimetype
      );

      const normalizedText = TextExtractorService.normalizeText(extractionResult.text);
      console.log(`✅ Texto extraído: ${normalizedText.length} caracteres`);

      // PASSO 3: Processar com Claude (usando função existente)
      console.log('🤖 Passo 3/4: Analisando com IA...');
      const dadosExtraidos = await processMPMPText(normalizedText);
      console.log('✅ Análise concluída');

      // PASSO 4: Criar projeto no banco
      console.log('💾 Passo 4/4: Criando projeto...');
      const projectData = {
        ...dadosExtraidos,
        name: dadosExtraidos.name || projectName,
        userId: 1, // Ajustar conforme autenticação
        cloudinaryFileId: uploadedFileId,
        originalFileName: req.file.originalname,
        fileUrl: uploadResult.url
      };

      const projeto = await storage.createProject(projectData);
      console.log('✅ Projeto criado com ID:', projeto.id);

      // Limpar arquivo temporário
      await fs.unlink(filePath);

      // Resposta completa com todos os dados
      res.json({
        success: true,
        message: 'Arquivo processado e projeto criado com sucesso!',
        arquivo: {
          id: uploadResult.fileId,
          url: uploadResult.url,
          size: uploadResult.size,
          format: uploadResult.format,
          pageCount: extractionResult.pageCount
        },
        projeto: {
          id: projeto.id,
          name: projeto.name,
          specialty: projeto.mainSpecialty,
          purpose: projeto.purpose,
          // Incluir outros campos relevantes do projeto
        },
        processamento: {
          caracteresExtraidos: normalizedText.length,
          tempoTotal: Date.now() - (parseInt(req.body.startTime) || Date.now())
        }
      });

    } catch (error) {
      console.error('❌ Erro no processamento unificado:', error);

      // Cleanup em caso de erro
      if (filePath) {
        try {
          await fs.unlink(filePath);
        } catch (cleanupError) {
          console.error('Erro ao limpar arquivo temporário:', cleanupError);
        }
      }

      // Se já fez upload mas falhou depois, podemos deletar do Cloudinary
      if (uploadedFileId && req.body.deleteOnError) {
        try {
          await UploadService.deleteFile(uploadedFileId);
          console.log('🗑️ Arquivo removido do Cloudinary após erro');
        } catch (deleteError) {
          console.error('Erro ao deletar arquivo do Cloudinary:', deleteError);
        }
      }

      res.status(500).json({
        success: false,
        message: 'Erro ao processar arquivo',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        stage: uploadedFileId ? 'processamento' : 'upload'
      });
    }
  });
```

### 3. Instalar Dependência pdf-parse

No terminal do Replit, execute:
```bash
npm install pdf-parse
```

### 4. Testar a Nova Rota

Execute o script de teste:
```bash
node test-upload-processar.js
```

## 🎯 Resultado Esperado

Quando funcionando corretamente, você verá:

```
✅ Processamento concluído com sucesso!

📊 Resumo do Processamento:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📁 ARQUIVO CLOUDINARY:
   ID: brio-ia/mpmp/demo-user/Teste-Upload-Processar
   URL: https://res.cloudinary.com/dpceyo4u3/...
   Tamanho: 1875 bytes
   Páginas: 1

🎯 PROJETO CRIADO:
   ID: 1
   Nome: Dr. João Silva
   Especialidade: Cardiologia Integrativa
   Propósito: Transformar a saúde cardiovascular...

⚡ MÉTRICAS:
   Caracteres extraídos: 1829
   Tempo total: 4523ms

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎉 Fluxo completo funcionando perfeitamente!
   Upload ✓ → Extração ✓ → Análise IA ✓ → Projeto Criado ✓
```

## 🚀 Próximos Passos

1. **Criar componente React** para interface de upload
2. **Adicionar suporte para PDFs reais** (não apenas TXT)
3. **Implementar processamento assíncrono** para arquivos grandes
4. **Adicionar progresso em tempo real** via WebSocket

## 📝 Observações Importantes

- A função `processMPMPText` já existe no arquivo (linha 1107)
- O `storage.createProject` já está implementado
- Para PDFs reais, o `pdf-parse` extrairá o texto automaticamente
- Em produção, considere usar queue (Bull) para processamento assíncrono
