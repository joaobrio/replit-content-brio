import fs from 'fs';
import { UploadService } from './services/uploadService.js';

// Função de teste
async function testCloudinary() {
  try {
    console.log('🚀 Testando upload para Cloudinary...\n');
    
    // Criar arquivo de teste
    fs.writeFileSync('teste.txt', 'Teste de upload Cloudinary - BRIO.IA - ' + new Date().toISOString());
    
    // Ler o arquivo
    const fileBuffer = fs.readFileSync('teste.txt');
    
    // Fazer upload
    const result = await UploadService.uploadFile(fileBuffer, {
      userId: 'demo-user',
      fileName: 'teste.txt',
      projectName: 'Teste-Cloudinary',
      tags: ['teste', 'brio-ia']
    });
    
    console.log('✅ Upload bem-sucedido!');
    console.log('📎 URL:', result.url);
    console.log('🆔 ID:', result.fileId);
    console.log('📏 Tamanho:', result.size, 'bytes');
    console.log('📅 Criado em:', result.createdAt);
    
    // Testar listagem
    console.log('\n📋 Listando arquivos do usuário...');
    const files = await UploadService.listUserFiles('demo-user');
    console.log(`Encontrados ${files.length} arquivo(s)\n`);
    
    // Limpar arquivo local
    fs.unlinkSync('teste.txt');
    console.log('🧹 Arquivo local removido');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\n⚠️  Verifique se as variáveis Cloudinary estão configuradas:');
    console.error('- CLOUDINARY_CLOUD_NAME');
    console.error('- CLOUDINARY_API_KEY');
    console.error('- CLOUDINARY_API_SECRET');
  }
}

// Executar teste
testCloudinary();
