#!/usr/bin/env node

/**
 * Script de Teste - Upload + Processamento MPMP
 * 
 * Testa a rota unificada /api/mpmp/upload-e-processar
 * que combina upload para Cloudinary + extração de texto + processamento IA
 */

const FormData = require('form-data');
const fs = require('fs');
const https = require('https');

// Configurações do teste
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const TEST_FILE_PATH = process.env.TEST_FILE_PATH || './exemplo-mpmp.txt';

// Função para fazer requisição HTTP
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const protocol = options.protocol === 'https:' ? https : require('http');
    
    const req = protocol.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: res.headers['content-type']?.includes('application/json') 
              ? JSON.parse(body) 
              : body
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// Função principal de teste
async function testUploadEProcessar() {
  console.log('🧪 === TESTE: Upload + Processamento MPMP ===\n');

  try {
    // Verificar se existe arquivo de teste
    let testFileContent = '';
    let useRealFile = false;

    if (fs.existsSync(TEST_FILE_PATH)) {
      console.log(`📄 Usando arquivo real: ${TEST_FILE_PATH}`);
      useRealFile = true;
    } else {
      console.log('📝 Criando arquivo de teste temporário...');
      testFileContent = `MANUAL DE POSICIONAMENTO DE MARCA PESSOAL

PROFISSIONAL: Dr. João Brio
ESPECIALIDADE: Estratégia Digital

PROPÓSITO:
Transformar profissionais em autoridades digitais através de estratégias baseadas em dados e neurociência aplicada.

HISTÓRIA DE ORIGEM:
Após 10 anos no marketing tradicional, descobri que a verdadeira transformação acontece quando combinamos estratégia, tecnologia e o elemento humano.

MISSÃO:
Democratizar o conhecimento em marketing digital e empoderar profissionais a construírem marcas pessoais autênticas e rentáveis.

PÚBLICO-ALVO:
- Idade: 25-45 anos
- Profissão: Empreendedores, consultores, coaches
- Localização: Brasil (foco São Paulo/Rio)
- Renda: Classes A e B

DORES DO PÚBLICO:
- Dificuldade em se posicionar como autoridade
- Falta de estratégia clara para redes sociais
- Não saber como gerar leads qualificados
- Insegurança para criar conteúdo

METODOLOGIA:
Sistema BRIO - Baseado em neurociência, dados e resultados mensuráveis.

DIFERENCIAIS:
- Abordagem científica ao marketing digital
- Foco em resultados mensuráveis
- Experiência comprovada com mais de 100 clientes

TOM DE VOZ:
- Formalidade: Equilibrado
- Energia: Moderada
- Proximidade: Profissional mas acessível`;

      fs.writeFileSync('./teste-mpmp-temp.txt', testFileContent);
    }

    // Preparar FormData
    console.log('📦 Preparando dados para upload...');
    const form = new FormData();
    
    if (useRealFile) {
      form.append('arquivo', fs.createReadStream(TEST_FILE_PATH));
    } else {
      form.append('arquivo', fs.createReadStream('./teste-mpmp-temp.txt'));
    }
    
    form.append('userId', 'test-user-123');
    form.append('projectName', 'Teste MPMP Automático');
    form.append('startTime', Date.now().toString());

    // Fazer requisição para upload + processamento
    console.log('🚀 Enviando para /api/mpmp/upload-e-processar...\n');
    
    const url = new URL(`${API_BASE_URL}/api/mpmp/upload-e-processar`);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: 'POST',
      headers: form.getHeaders(),
      protocol: url.protocol
    };

    const response = await makeRequest(options, form);

    // Analisar resposta
    console.log('📊 RESULTADO DO TESTE:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`Status: ${response.status}`);
    console.log(`Content-Type: ${response.headers['content-type']}`);
    
    if (response.status === 200) {
      console.log('✅ SUCESSO!');
      console.log('\n🎯 Dados retornados:');
      console.log(JSON.stringify(response.data, null, 2));
      
      if (response.data.success) {
        console.log('\n📈 MÉTRICAS:');
        console.log(`- Arquivo ID: ${response.data.arquivo.id}`);
        console.log(`- URL Cloudinary: ${response.data.arquivo.url}`);
        console.log(`- Tamanho: ${response.data.arquivo.size} bytes`);
        console.log(`- Projeto ID: ${response.data.projeto.id}`);
        console.log(`- Nome: ${response.data.projeto.name}`);
        console.log(`- Especialidade: ${response.data.projeto.specialty}`);
        console.log(`- Caracteres extraídos: ${response.data.processamento.caracteresExtraidos}`);
        console.log(`- Tempo total: ${response.data.processamento.tempoTotal}ms`);
      }
    } else {
      console.log('❌ ERRO!');
      console.log('\n📋 Detalhes do erro:');
      console.log(JSON.stringify(response.data, null, 2));
    }

    // Limpar arquivo temporário se foi criado
    if (!useRealFile && fs.existsSync('./teste-mpmp-temp.txt')) {
      fs.unlinkSync('./teste-mpmp-temp.txt');
      console.log('\n🗑️ Arquivo temporário removido');
    }

  } catch (error) {
    console.error('💥 ERRO NO TESTE:', error.message);
    
    // Cleanup
    if (fs.existsSync('./teste-mpmp-temp.txt')) {
      fs.unlinkSync('./teste-mpmp-temp.txt');
    }
  }
}

// Função para testar apenas a extração de texto
async function testTextExtraction() {
  console.log('\n🔍 === TESTE: Extração de Texto ===\n');
  
  try {
    const testText = 'Este é um teste de extração de texto.';
    const testBuffer = Buffer.from(testText, 'utf-8');
    
    // Para testar via API, precisaríamos de um endpoint específico
    console.log('📝 Texto de teste criado:', testText);
    console.log('📦 Buffer size:', testBuffer.length);
    
    // Se o TextExtractorService estivesse disponível localmente:
    // const result = await TextExtractorService.extractTextFromFile(testBuffer, 'text/plain');
    // console.log('✅ Resultado:', result);
    
  } catch (error) {
    console.error('❌ Erro na extração:', error.message);
  }
}

// Executar testes
async function runAllTests() {
  console.log('🎬 Iniciando bateria de testes MPMP...\n');
  
  await testUploadEProcessar();
  await testTextExtraction();
  
  console.log('\n🏁 Testes concluídos!');
}

// Se executado diretamente
if (require.main === module) {
  runAllTests().catch(console.error);
}

module.exports = {
  testUploadEProcessar,
  testTextExtraction,
  runAllTests
};
