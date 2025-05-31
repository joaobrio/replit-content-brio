/**
 * Script de teste para a rota unificada /api/mpmp/upload-e-processar
 * Testa o fluxo completo: upload → extração → análise → projeto
 */

const fs = require('fs');
const FormData = require('form-data');

// Configuração
const API_URL = process.env.API_URL || 'http://localhost:5000';
const TEST_FILE_PATH = process.argv[2] || 'test-mpmp.txt';

// Cores para o console
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Criar arquivo de teste se não existir
function createTestFile() {
  if (!fs.existsSync(TEST_FILE_PATH)) {
    const testContent = `
MANUAL DE POSICIONAMENTO DE MARCA PESSOAL - MPMP

DADOS DO PROFISSIONAL
Nome: Dr. João Silva
Especialidade: Cardiologia Intervencionista
Subespecialidades: Hemodinâmica, Cardiologia Esportiva

PROPÓSITO E MISSÃO
Propósito: Democratizar o acesso à saúde cardiovascular preventiva através da educação e tecnologia
Missão: Transformar a cardiologia tradicional em uma especialidade acessível e preventiva
História de Origem: Após perder meu pai para um infarto evitável aos 50 anos, dediquei minha carreira a prevenir tragédias similares

ARQUÉTIPO E POSICIONAMENTO
Arquétipo: Cuidador Inovador
Superpoderes: Comunicação médica simplificada, Diagnóstico precoce de alto risco
Vulnerabilidades: Perfeccionismo excessivo, Dificuldade em delegar

PÚBLICO-ALVO
Demografia:
- Idade: 35-65 anos
- Gênero: Todos
- Localização: Grandes centros urbanos
- Poder Aquisitivo: Classes A e B

Psicografia:
- Dores: Medo de doenças cardíacas, Falta de tempo para cuidar da saúde
- Desejos: Longevidade com qualidade, Prevenção eficaz
- Objeções: Custo dos exames, Complexidade dos tratamentos
- Gatilhos: Histórico familiar, Sintomas de alerta

DIFERENCIAIS E METODOLOGIA
Diferenciais: 
- Protocolo exclusivo de avaliação em 48h
- Telemedicina com monitoramento contínuo
- Linguagem acessível sem "mediquês"

Metodologia: Método CARDIO+ (Check-up, Análise, Rotina, Dieta, Indicadores, Otimização)

COMUNICAÇÃO E IDENTIDADE VISUAL
Tom de Voz:
- Formalidade: Equilibrado
- Energia: Moderada
- Proximidade: Profissional amigável

Palavras-chave: prevenção, coração saudável, longevidade, check-up cardíaco
Evitar: termos técnicos complexos, alarmismo, promessas milagrosas

Cores da Marca: #E74C3C (vermelho vida), #2C3E50 (azul confiança)
Estilo Visual: Minimalista e profissional

PRESENÇA DIGITAL
Hashtags principais: #CardiologiaPreventiva #CoracaoSaudavel #DrJoaoCardio
Assinatura dos posts: "Seu coração em boas mãos 💗 | Dr. João Silva - CRM 12345"
Bio padrão: "Cardiologista | Prevenção é o melhor remédio | +15 anos salvando vidas | Consultas presenciais e online 📍SP"
`;
    
    fs.writeFileSync(TEST_FILE_PATH, testContent.trim());
    log(`✅ Arquivo de teste criado: ${TEST_FILE_PATH}`, 'green');
    return true;
  }
  return false;
}

// Função principal de teste
async function testUploadEProcessar() {
  log('\n🚀 TESTE DA ROTA UNIFICADA - Upload + Processamento MPMP\n', 'bright');
  
  // Verificar/criar arquivo de teste
  const fileCreated = createTestFile();
  if (fileCreated) {
    log('ℹ️  Usando arquivo de teste padrão criado automaticamente\n', 'yellow');
  }

  // Verificar se o arquivo existe
  if (!fs.existsSync(TEST_FILE_PATH)) {
    log(`❌ Arquivo não encontrado: ${TEST_FILE_PATH}`, 'red');
    log('   Use: node test-api-upload-processar.js <caminho-do-arquivo>', 'yellow');
    process.exit(1);
  }

  // Preparar o formulário
  const form = new FormData();
  form.append('arquivo', fs.createReadStream(TEST_FILE_PATH));
  form.append('userId', 'test-user-' + Date.now());
  form.append('projectName', 'Teste Automatizado API');
  form.append('startTime', Date.now().toString());
  form.append('deleteOnError', 'true'); // Limpar em caso de erro

  log(`📄 Arquivo: ${TEST_FILE_PATH}`, 'cyan');
  log(`📏 Tamanho: ${fs.statSync(TEST_FILE_PATH).size} bytes`, 'cyan');
  log(`🔗 Endpoint: ${API_URL}/api/mpmp/upload-e-processar\n`, 'cyan');

  try {
    log('⏳ Enviando arquivo e processando...', 'yellow');
    const startTime = Date.now();

    // Fazer requisição
    const fetch = require('node-fetch');
    const response = await fetch(`${API_URL}/api/mpmp/upload-e-processar`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const result = await response.json();
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    if (response.ok && result.success) {
      log(`\n✅ SUCESSO! Processamento concluído em ${duration}s\n`, 'green');
      
      // Exibir resultados
      log('📊 RESULTADOS:', 'bright');
      log('─'.repeat(50));
      
      if (result.arquivo) {
        log('\n📁 Arquivo no Cloudinary:', 'blue');
        log(`   ID: ${result.arquivo.id}`);
        log(`   URL: ${result.arquivo.url}`);
        log(`   Formato: ${result.arquivo.format}`);
        log(`   Páginas: ${result.arquivo.pageCount || 1}`);
      }

      if (result.projeto) {
        log('\n🎯 Projeto Criado:', 'blue');
        log(`   ID: ${result.projeto.id}`);
        log(`   Nome: ${result.projeto.name}`);
        log(`   Especialidade: ${result.projeto.specialty || 'N/A'}`);
        log(`   Propósito: ${result.projeto.purpose || 'N/A'}`);
      }

      if (result.processamento) {
        log('\n⚡ Métricas de Processamento:', 'blue');
        log(`   Caracteres extraídos: ${result.processamento.caracteresExtraidos}`);
        log(`   Tempo total: ${(result.processamento.tempoTotal / 1000).toFixed(2)}s`);
      }

      log('\n' + '─'.repeat(50));
      log('🎉 Teste concluído com sucesso!', 'green');

    } else {
      log(`\n❌ ERRO no processamento (${duration}s)\n`, 'red');
      log(`Status: ${response.status} ${response.statusText}`);
      log(`Mensagem: ${result.message || 'Erro desconhecido'}`);
      
      if (result.error) {
        log(`Detalhes: ${result.error}`);
      }
      
      if (result.stage) {
        log(`Estágio do erro: ${result.stage}`);
      }

      // Log completo do erro para debug
      log('\nResposta completa:', 'yellow');
      console.log(JSON.stringify(result, null, 2));
    }

  } catch (error) {
    log('\n❌ ERRO na requisição:', 'red');
    log(error.message, 'red');
    
    if (error.code === 'ECONNREFUSED') {
      log('\n⚠️  Servidor não está rodando?', 'yellow');
      log(`   Verifique se o servidor está ativo em ${API_URL}`, 'yellow');
    }
  }

  // Limpar arquivo de teste se foi criado automaticamente
  if (fileCreated && fs.existsSync(TEST_FILE_PATH)) {
    fs.unlinkSync(TEST_FILE_PATH);
    log('\n🧹 Arquivo de teste temporário removido', 'cyan');
  }
}

// Verificar dependências
async function checkDependencies() {
  try {
    require('form-data');
    require('node-fetch');
  } catch (error) {
    log('📦 Instalando dependências necessárias...', 'yellow');
    require('child_process').execSync('npm install form-data node-fetch', { 
      stdio: 'inherit' 
    });
  }
}

// Executar teste
(async () => {
  await checkDependencies();
  await testUploadEProcessar();
})();
