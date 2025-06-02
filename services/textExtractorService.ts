interface ExtractionResult {
  text: string;
  pageCount?: number;
  metadata?: any;
  wordCount?: number;
  characterCount?: number;
  processingTime?: number;
}

export class TextExtractorService {
  /**
   * Extrai texto de um arquivo baseado em sua URL ou buffer
   * Suporta TXT, DOC/DOCX com retry automático e timeout
   * PDF temporariamente desabilitado
   */
  static async extractTextFromFile(
    fileUrlOrBuffer: string | Buffer, 
    fileType: string,
    options: { timeout?: number; retries?: number } = {}
  ): Promise<ExtractionResult> {
    const startTime = Date.now();
    const { timeout = 30000, retries = 2 } = options;
    
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const result = await Promise.race([
          this._extractWithTimeout(fileUrlOrBuffer, fileType),
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Timeout na extração de texto')), timeout)
          )
        ]);
        
        // Adicionar métricas de processamento
        const processingTime = Date.now() - startTime;
        return {
          ...result,
          processingTime,
          wordCount: this.countWords(result.text),
          characterCount: result.text.length
        };
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Erro desconhecido');
        console.warn(`Tentativa ${attempt + 1}/${retries + 1} falhou:`, lastError.message);
        
        if (attempt < retries) {
          // Delay exponencial entre tentativas
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    }
    
    throw new Error(`Falha na extração após ${retries + 1} tentativas: ${lastError?.message}`);
  }

  /**
   * Método interno para extração com validação aprimorada
   */
  private static async _extractWithTimeout(
    fileUrlOrBuffer: string | Buffer, 
    fileType: string
  ): Promise<ExtractionResult> {
    let buffer: Buffer;
    
    // Download com timeout se for URL
    if (typeof fileUrlOrBuffer === 'string') {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      try {
        const response = await fetch(fileUrlOrBuffer, { 
          signal: controller.signal,
          headers: { 'User-Agent': 'BRIO.IA TextExtractor/1.0' }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        buffer = Buffer.from(await response.arrayBuffer());
      } finally {
        clearTimeout(timeoutId);
      }
    } else {
      buffer = fileUrlOrBuffer;
    }

    // Validação de buffer
    if (!this.validateFileBuffer(buffer, fileType)) {
      throw new Error(`Buffer inválido ou corrompido para tipo ${fileType}`);
    }

    // Processar baseado no tipo com fallbacks
    const normalizedType = fileType.toLowerCase();
    
    switch (normalizedType) {
      case 'pdf':
      case 'application/pdf':
        throw new Error('Processamento de PDF temporariamente desabilitado. Use formatos como DOCX, TXT ou imagens.');
        
      case 'txt':
      case 'text/plain':
        return this.extractFromText(buffer);
        
      case 'doc':
      case 'docx':
      case 'application/msword':
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return this.extractFromDocument(buffer, normalizedType);
        
      default:
        // Fallback: tentar como texto
        console.warn(`Tipo não reconhecido ${fileType}, tentando como texto`);
        return this.extractFromText(buffer);
    }
  }

  /**
   * Extração de texto simples com encoding automático
   */
  private static extractFromText(buffer: Buffer): ExtractionResult {
    // Detectar encoding (básico)
    let text: string;
    
    try {
      // Tentar UTF-8 primeiro
      text = buffer.toString('utf-8');
      
      // Verificar se há caracteres de controle inválidos
      if (text.includes('\uFFFD')) {
        // Fallback para latin1
        text = buffer.toString('latin1');
      }
    } catch (error) {
      // Último recurso: ASCII
      text = buffer.toString('ascii');
    }

    return {
      text,
      pageCount: 1,
      metadata: {
        extractionMethod: 'text-plain',
        encoding: 'auto-detected'
      }
    };
  }

  /**
   * Extração básica para DOC/DOCX (placeholder para mammoth.js)
   */
  private static extractFromDocument(buffer: Buffer, fileType: string): ExtractionResult {
    // TODO: Integrar mammoth.js para melhor suporte a DOC/DOCX
    // Por ora, tentativa básica de extração
    
    let text: string;
    
    if (fileType.includes('docx')) {
      // DOCX é um ZIP, pode tentar extrair XML
      try {
        text = buffer.toString('utf-8');
        // Remover tags XML básicas
        text = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      } catch {
        text = 'Erro: DOCX requer processamento específico. Use PDF ou TXT.';
      }
    } else {
      // DOC é binário, extração limitada
      text = 'Erro: DOC requer processamento específico. Use PDF ou TXT.';
    }

    return {
      text,
      metadata: { 
        warning: 'Extração básica de DOC/DOCX - recomenda-se converter para PDF',
        extractionMethod: 'basic-binary'
      }
    };
  }

  /**
   * Normalização avançada de texto
   */
  static normalizeText(text: string): string {
    return text
      // Normalizar espaços em branco
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\t/g, ' ')
      .replace(/\s+/g, ' ')
      // Remover quebras excessivas
      .replace(/\n{3,}/g, '\n\n')
      // Remover caracteres de controle
      .replace(/[\x00-\x1F\x7F]/g, '')
      // Normalizar Unicode
      .normalize('NFC')
      .trim();
  }

  /**
   * Validação aprimorada de buffer
   */
  static validateFileBuffer(buffer: Buffer, fileType: string): boolean {
    if (!buffer || buffer.length === 0) {
      return false;
    }

    // Tamanho mínimo razoável
    if (buffer.length < 10) {
      return false;
    }

    // Magic numbers para validação
    const magicNumbers = {
      pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
      doc: [0xD0, 0xCF, 0x11, 0xE0], // DOC
      docx: [0x50, 0x4B, 0x03, 0x04], // DOCX (ZIP)
    };

    if (fileType.includes('pdf')) {
      return buffer.slice(0, 4).equals(Buffer.from(magicNumbers.pdf));
    }

    if (fileType.includes('doc') && !fileType.includes('docx')) {
      return buffer.slice(0, 4).equals(Buffer.from(magicNumbers.doc));
    }

    if (fileType.includes('docx')) {
      return buffer.slice(0, 4).equals(Buffer.from(magicNumbers.docx));
    }

    // Para texto, verificar se é válido UTF-8 ou ASCII
    if (fileType.includes('text')) {
      try {
        const text = buffer.toString('utf-8');
        return text.length > 0 && !text.includes('\uFFFD');
      } catch {
        return false;
      }
    }

    return true;
  }

  /**
   * Contador de palavras inteligente
   */
  static countWords(text: string): number {
    if (!text || text.trim().length === 0) return 0;
    
    return text
      .trim()
      .split(/\s+/)
      .filter(word => word.length > 0)
      .length;
  }

  /**
   * Preview inteligente com resumo
   */
  static getTextPreview(text: string, maxLength: number = 500): string {
    if (!text || text.trim().length === 0) {
      return 'Texto vazio';
    }
    
    if (text.length <= maxLength) {
      return text;
    }
    
    // Tentar cortar em frase completa
    const sentences = text.split(/[.!?]+/);
    let preview = '';
    
    for (const sentence of sentences) {
      const testPreview = preview + sentence + '.';
      if (testPreview.length > maxLength) {
        break;
      }
      preview = testPreview;
    }
    
    // Se não conseguiu uma frase, cortar por palavra
    if (preview.length === 0) {
      const cutIndex = text.lastIndexOf(' ', maxLength);
      preview = text.substring(0, cutIndex > 0 ? cutIndex : maxLength);
    }
    
    return preview.trim() + (preview.length < text.length ? '...' : '');
  }

  /**
   * Análise de qualidade do texto extraído
   */
  static analyzeTextQuality(text: string): {
    score: number;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];
    let score = 100;

    // Verificar tamanho
    if (text.length < 50) {
      issues.push('Texto muito curto');
      suggestions.push('Verificar se o arquivo contém o conteúdo esperado');
      score -= 30;
    }

    // Verificar caracteres especiais excessivos
    const specialChars = (text.match(/[^\w\s\.\,\!\?\-]/g) || []).length;
    const specialRatio = specialChars / text.length;
    
    if (specialRatio > 0.1) {
      issues.push('Muitos caracteres especiais (possível OCR de baixa qualidade)');
      suggestions.push('Considerar melhorar a qualidade do PDF original');
      score -= 20;
    }

    // Verificar repetições excessivas
    const words = text.split(/\s+/);
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    const repetitionRatio = uniqueWords.size / words.length;
    
    if (repetitionRatio < 0.3) {
      issues.push('Texto com muitas repetições');
      suggestions.push('Verificar se a extração foi correta');
      score -= 15;
    }

    // Verificar estrutura de frases
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const avgSentenceLength = text.length / sentences.length;
    
    if (avgSentenceLength > 500) {
      issues.push('Frases muito longas (possível problema de formatação)');
      suggestions.push('Revisar a formatação do documento original');
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      issues,
      suggestions
    };
  }

  /**
   * Utility: delay para retry
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}