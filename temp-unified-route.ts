// Nova rota unificada - Upload + Processamento MPMP
// Esta rota será integrada ao routes.ts principal

import { TextExtractorService } from '../services/textExtractorService';

// Adicionar esta rota ANTES do comentário "// ========== FIM DAS ROTAS CLOUDINARY =========="

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

    console.log(`🚀 Iniciando processamento: ${req.file.originalname}`);

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

    // PASSO 3: Processar com Claude (reutilizar função existente)
    console.log('🤖 Passo 3/4: Analisando com IA...');
    const dadosExtraidos = await processMPMPText(normalizedText);
    console.log('✅ Análise concluída');

    // PASSO 4: Criar projeto no banco
    console.log('💾 Passo 4/4: Criando projeto...');
    const projectData = {
      ...dadosExtraidos,
      name: dadosExtraidos.name || projectName,
      userId: 1, // Ajustar conforme autenticação real
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
        purpose: projeto.purpose
      },
      processamento: {
        caracteresExtraidos: normalizedText.length,
        tempoTotal: Date.now() - (parseInt(req.body.startTime) || Date.now())
      }
    });

  } catch (error) {
    console.error('❌ Erro no processamento:', error);

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
