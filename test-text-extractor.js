/**
 * Script de teste isolado para o TextExtractorService
 * Testa extração de texto de diferentes tipos de arquivo
 */

const fs = require('fs');
const path = require('path');

// Simular o comportamento do TextExtractorService para teste
class TextExtractorServiceTest {
  static async extractTextFromFile(fileBufferOrPath, mimeType) {
    let buffer;
    
    if (typeof fileBufferOrPath === 'string') {
      buffer = fs.readFileSync(fileBufferOrPath);
    } else {
      buffer = fileBufferOrPath;
    }

    switch (mimeType) {
      case 'text/plain':
        return {
          text: buffer.toString('utf-8'),
          pageCount: 1
        };
      
      case 'application/pdf':
        // Simulação básica para teste sem pdf-parse
        return {
          text: 'Conteúdo simulado do PDF para teste',
          pageCount: 1,
          metadata: { simulated: true }
        };
      
      default:
        throw new Error(`Tipo não suportado: ${mimeType}`);
    }
  }

  static normalizeText(text) {
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  static getTextPreview(text, maxLength = 100) {
    if (text.length <= maxLength) {
      return text;
    }
    const cutIndex = text.lastIndexOf(' ', maxLength);
    return text.substring(0, cutIndex > 0 ? cutIndex : maxLength) + '...';
  }
}

// Função principal de teste
async function runTests() {
  console.log('🧪 Iniciando testes do TextExtractorService\n');

  // Teste 1: Arquivo TXT
  console.log('📝 Teste 1: Extração de arquivo TXT');
  try {
    const txtContent = `MANUAL DE POSICIONAMENTO DE MARCA PESSOAL

    Nome: Dr. João Silva
    Especialidade: Cardiologia
    Propósito: Transformar vidas através da medicina preventiva
    
    Este é um exemplo de conteúdo MPMP para teste.`;
    
    fs.writeFileSync('test-mpmp.txt', txtContent);
    
    const result = await TextExtractorServiceTest.extractTextFromFile(
      'test-mpmp.txt',
      'text/plain'
    );
    
    console.log('✅ Extração TXT bem-sucedida');
    console.log(`   Caracteres extraídos: ${result.text.length}`);
    console.log(`   Preview: "${TextExtractorServiceTest.getTextPreview(result.text)}"`);
    
    fs.unlinkSync('test-mpmp.txt');
  } catch (error) {
    console.error('❌ Erro no teste TXT:', error.message);
  }

  // Teste 2: Buffer direto
  console.log('\n💾 Teste 2: Extração de Buffer');
  try {
    const bufferContent = Buffer.from('Conteúdo direto via buffer para teste');
    const result = await TextExtractorServiceTest.extractTextFromFile(
      bufferContent,
      'text/plain'
    );
    
    console.log('✅ Extração de Buffer bem-sucedida');
    console.log(`   Texto: "${result.text}"`);
  } catch (error) {
    console.error('❌ Erro no teste de Buffer:', error.message);
  }

  // Teste 3: Normalização de texto
  console.log('\n🔧 Teste 3: Normalização de texto');
  try {
    const messyText = `Texto    com     muitos      espaços


    
    E muitas
    
    
    quebras de linha`;
    
    const normalized = TextExtractorServiceTest.normalizeText(messyText);
    console.log('✅ Normalização bem-sucedida');
    console.log(`   Original: ${messyText.length} chars`);
    console.log(`   Normalizado: ${normalized.length} chars`);
    console.log(`   Resultado: "${normalized}"`);
  } catch (error) {
    console.error('❌ Erro na normalização:', error.message);
  }

  // Teste 4: Preview de texto
  console.log('\n✂️ Teste 4: Preview de texto');
  try {
    const longText = 'Este é um texto muito longo que precisa ser cortado para criar um preview adequado sem cortar palavras no meio da frase.';
    const preview = TextExtractorServiceTest.getTextPreview(longText, 50);
    
    console.log('✅ Preview criado com sucesso');
    console.log(`   Original: ${longText.length} chars`);
    console.log(`   Preview: "${preview}"`);
  } catch (error) {
    console.error('❌ Erro no preview:', error.message);
  }

  // Teste 5: Tipo não suportado
  console.log('\n🚫 Teste 5: Tipo de arquivo não suportado');
  try {
    await TextExtractorServiceTest.extractTextFromFile(
      Buffer.from('teste'),
      'application/unknown'
    );
    console.error('❌ Deveria ter lançado erro para tipo não suportado');
  } catch (error) {
    console.log('✅ Erro capturado corretamente:', error.message);
  }

  console.log('\n✨ Testes concluídos!');
  console.log('\n📌 Próximo passo: Testar com PDF real após instalar pdf-parse');
  console.log('   Execute: node test-text-extractor.js --with-pdf');
}

// Teste com PDF real (requer pdf-parse instalado)
async function testWithRealPDF() {
  console.log('\n📄 Teste com PDF real (requer pdf-parse)');
  
  try {
    // Verificar se pdf-parse está instalado
    require.resolve('pdf-parse');
    
    // Criar um PDF de teste simples
    const pdfContent = `%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /Resources << /Font << /F1 << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> >> >> /MediaBox [0 0 612 792] /Contents 4 0 R >>
endobj
4 0 obj
<< /Length 44 >>
stream
BT /F1 12 Tf 100 700 Td (Teste PDF) Tj ET
endstream
endobj
xref
0 5
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000308 00000 n
trailer
<< /Size 5 /Root 1 0 R >>
startxref
402
%%EOF`;

    fs.writeFileSync('test.pdf', pdfContent);
    
    console.log('⚠️  PDF de teste criado, mas extração real requer pdf-parse');
    console.log('   Para testar extração real de PDF:');
    console.log('   1. Certifique-se que pdf-parse está instalado');
    console.log('   2. Use o TextExtractorService real, não esta simulação');
    
    fs.unlinkSync('test.pdf');
    
  } catch (error) {
    console.log('ℹ️  pdf-parse não está instalado. Pulando teste de PDF real.');
  }
}

// Executar testes
(async () => {
  await runTests();
  
  // Verificar argumento para teste com PDF
  if (process.argv.includes('--with-pdf')) {
    await testWithRealPDF();
  }
})();
