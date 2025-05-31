// Teste simples de upload para Cloudinary
import fetch from 'node-fetch';
import FormData from 'form-data';
import fs from 'fs';

async function testCloudinaryAPI() {
  console.log('🚀 Testando upload via API...\n');

  try {
    // Criar arquivo de teste
    const testContent = 'Teste de upload Cloudinary - BRIO.IA - ' + new Date().toISOString();
    fs.writeFileSync('teste.txt', testContent);
    
    // Criar FormData
    const form = new FormData();
    form.append('arquivo', fs.createReadStream('teste.txt'));
    form.append('userId', 'demo-user');
    form.append('projectName', 'Teste-Cloudinary');

    // Fazer requisição
    const response = await fetch('http://localhost:5000/api/mpmp/upload-cloud', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders(),
        'Accept': 'application/json'
      }
    });

    // Processar resposta
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Upload bem-sucedido!');
      console.log(JSON.stringify(data, null, 2));
    } else {
      console.error('❌ Erro no upload:');
      console.error(JSON.stringify(data, null, 2));
    }

    // Limpar arquivo
    fs.unlinkSync('teste.txt');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\n💡 Possíveis causas:');
    console.error('1. Servidor não está rodando na porta 5000');
    console.error('2. Variáveis Cloudinary não configuradas');
    console.error('3. Problema de rede/conexão');
  }
}

// Executar
testCloudinaryAPI();
