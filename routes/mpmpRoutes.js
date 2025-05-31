const express = require('express');
const multer = require('multer');
const router = express.Router();
const UploadService = require('../services/uploadService');
const DatabaseService = require('../services/databaseService');

// Configurar multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  }
});

// Upload de arquivo
router.post('/upload', upload.single('arquivo'), async (req, res) => {
  try {
    const { nome_projeto, descricao } = req.body;
    const userId = req.session?.userId || 'demo'; // Ajuste conforme sua autenticação
    const file = req.file;

    if (!file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Upload para Cloudinary
    const uploadResult = await UploadService.uploadFile(file.buffer, {
      userId,
      fileName: `${Date.now()}_${file.originalname}`
    });

    // Salvar no banco
    const projectData = await DatabaseService.saveProject({
      userId,
      nomeProjeto: nome_projeto,
      descricao,
      cloudId: uploadResult.fileId,
      url: uploadResult.url,
      nomeOriginal: file.originalname,
      tamanho: uploadResult.size,
      formato: uploadResult.format
    });

    res.json({
      success: true,
      message: 'Projeto salvo com sucesso!',
      projeto: projectData
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao processar upload' });
  }
});

// Listar projetos
router.get('/projetos', async (req, res) => {
  try {
    const userId = req.session?.userId || 'demo';
    const projetos = await DatabaseService.getUserProjects(userId);

    res.json({
      success: true,
      projetos
    });

  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    res.status(500).json({ error: 'Erro ao buscar projetos' });
  }
});

// Deletar projeto
router.delete('/projetos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.session?.userId || 'demo';

    const projeto = await DatabaseService.deleteProject(id, userId);

    if (projeto) {
      await UploadService.deleteFile(projeto.arquivo_cloud_id);
    }

    res.json({
      success: true,
      message: 'Projeto deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar:', error);
    res.status(500).json({ error: 'Erro ao deletar projeto' });
  }
});

module.exports = router;