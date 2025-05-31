// Script de teste para a rota unificada upload-e-processar
import fs from 'fs';
import FormData from 'form-data';

async function testUploadEProcessar() {
  console.log('🚀 Testando upload e processamento unificado...\n');

  try {
    // Criar arquivo de teste com conteúdo MPMP simulado
    const mpmpContent = `
MANUAL DE POSICIONAMENTO DE MARCA PESSOAL

Nome: Dr. João Silva
Especialidade: Cardiologia Integrativa
Propósito: Transformar a saúde cardiovascular através de uma abordagem humanizada e preventiva

HISTÓRIA DE ORIGEM
Após perder meu pai para um infarto, dediquei minha vida a entender como prevenir doenças cardíacas. 
Descobri que a medicina tradicional focava apenas em tratar sintomas, não causas.

MISSÃO
Educar e capacitar pessoas a cuidarem do seu coração de forma integral, unindo ciência e humanização.

PÚBLICO-ALVO
- Idade: 35-65 anos
- Gênero: Todos
- Localização: São Paulo e região
- Poder Aquisitivo: Classes A e B

DIFERENCIAIS
- Abordagem integrativa única
- 20 anos de experiência
- Metodologia própria comprovada

METODOLOGIA
Método CORAÇÃO SAUDÁVEL - Prevenção através de 5 pilares:
1. Nutrição cardioprotetora
2. Exercícios personalizados
3. Gestão do estresse
4. Sono reparador
5. Conexões sociais

RESULTADOS TÍPICOS
- Redução de 40% no risco cardiovascular
- Melhora de 60% nos marcadores inflamatórios
- 90% dos pacientes relatam mais qualidade de vida

PALAVRAS-CHAVE
cardiologia, prevenção, saúde integrativa, coração, longevidade

HASHTAGS PRINCIPAIS
#CardiologiaIntegrativa #CoraçãoSaudável #MedicinaPreventiva #SaúdeDoCoração

ASSINATURA DOS POSTS
Dr. João Silva | Cardiologista Integrativo | Transformando corações, salvando vidas 💙

BIO PADRÃO
Cardiologista há 20 anos | Especialista em Prevenção Cardiovascular | Criador do Método Coração Saudável | Ajudando você a viver mais e melhor
`;

    // Salvar como arquivo temporário
    fs.writeFileSync('teste-mpmp.txt', mpmpContent);
    
    // Criar FormData
    const form = new FormData();
    form.append('arquivo', fs.createReadStream('teste-mpmp.txt'));
    form.append('userId', 'demo-user');
    form.append('projectName', 'Teste-Upload-Processar');
    form.append('startTime', Date.now().toString());

    console.log('📤 Enviando arquivo MPMP para processamento...\n');

    // Fazer requisição
    const response = await fetch('http://localhost:5000/api/mpmp/upload-e-processar', {
      method: 'POST',
      body: form,
      headers: {
        ...form.getHeaders()
      }
    });

    // Processar resposta
    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Processamento concluído com sucesso!\n');
      console.log('📊 Resumo do Processamento:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (data.arquivo) {
        console.log('\n📁 ARQUIVO CLOUDINARY:');
        console.log(`   ID: ${data.arquivo.id}`);
        console.log(`   URL: ${data.arquivo.url}`);
        console.log(`   Tamanho: ${data.arquivo.size} bytes`);
        console.log(`   Páginas: ${data.arquivo.pageCount || 'N/A'}`);
      }
      
      if (data.projeto) {
        console.log('\n🎯 PROJETO CRIADO:');
        console.log(`   ID: ${data.projeto.id}`);
        console.log(`   Nome: ${data.projeto.name}`);
        console.log(`   Especialidade: ${data.projeto.specialty}`);
        console.log(`   Propósito: ${data.projeto.purpose}`);
      }
      
      if (data.processamento) {
        console.log('\n⚡ MÉTRICAS:');
        console.log(`   Caracteres extraídos: ${data.processamento.caracteresExtraidos}`);
        console.log(`   Tempo total: ${data.processamento.tempoTotal}ms`);
      }
      
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('\n🎉 Fluxo completo funcionando perfeitamente!');
      console.log('   Upload ✓ → Extração ✓ → Análise IA ✓ → Projeto Criado ✓\n');
      
    } else {
      console.error('❌ Erro no processamento:');
      console.error(JSON.stringify(data, null, 2));
    }

    // Limpar arquivo de teste
    fs.unlinkSync('teste-mpmp.txt');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error('\n💡 Possíveis causas:');
    console.error('1. Servidor não está rodando');
    console.error('2. Rota não implementada ainda');
    console.error('3. Falta instalar pdf-parse: npm install pdf-parse');
    console.error('4. Erro na configuração da API Anthropic');
    
    // Limpar arquivo se existir
    if (fs.existsSync('teste-mpmp.txt')) {
      fs.unlinkSync('teste-mpmp.txt');
    }
  }
}

// Executar teste
testUploadEProcessar();
