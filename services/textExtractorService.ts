import pdfParse from 'pdf-parse';

interface ExtractionResult {
  text: string;
  pageCount?: number;
  metadata?: any;
}

// Type definitions for pdf-parse
declare module 'pdf-parse' {
  interface PDFInfo {
    [key: string]: any;
  }
  
  interface PDFData {
    numpages: number;
    numrender: number;
    info: PDFInfo;
    metadata: any;
    text: string;
    version: string;
  }
  
  function pdfParse(buffer: Buffer): Promise<PDFData>;
  export = pdfParse;
}

export class TextExtractorService {
  /**
   * Extrai texto de um arquivo baseado em sua URL ou buffer
   * Suporta PDF, TXT, DOC/DOCX
   */
  static async extractTextFromFile(
    fileUrlOrBuffer: string | Buffer, 
    fileType: string
  ): Promise<ExtractionResult> {
    try {
      let buffer: Buffer;
      
      // Se for URL, fazer download primeiro
      if (typeof fileUrlOrBuffer === 'string') {
        const response = await fetch(fileUrlOrBuffer);
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        buffer = fileUrlOrBuffer;
      }

      // Processar baseado no tipo de arquivo
      switch (fileType.toLowerCase()) {
        case 'pdf':
        case 'application/pdf':
          return await this.extractFromPDF(buffer);
          
        case 'txt':
        case 'text/plain':
          return {
            text: buffer.toString('utf-8'),
            pageCount: 1
          };
          
        case 'doc':
        case 'docx':
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          // Para DOC/DOCX, você pode usar mammoth.js futuramente
          // Por ora, vamos tratar como texto simples
          return {
            text: buffer.toString('utf-8'),
            metadata: { warning: 'Extração básica de DOC/DOCX - considere usar mammoth.js para melhor suporte' }
          };
          
        default:
          throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
      }
    } catch (error) {
      console.error('Erro ao extrair texto:', error);
      throw new Error(`Falha na extração de texto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  }

  /**
   * Extração específica para PDF usando pdf-parse
   */
  private static async extractFromPDF(buffer: Buffer): Promise<ExtractionResult> {
    try {
      const data = await pdfParse(buffer);
      
      return {
        text: data.text,
        pageCount: data.numpages,
        metadata: {
          info: data.info,
          metadata: data.metadata,
          version: data.version
        }
      };
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      throw new Error('Falha ao extrair texto do PDF');
    }
  }

  /**
   * Limpa e normaliza o texto extraído
   */
  static normalizeText(text: string): string {
    return text
      .replace(/\s+/g, ' ') // Múltiplos espaços para um
      .replace(/\n{3,}/g, '\n\n') // Máximo 2 quebras de linha
      .trim();
  }

  /**
   * Valida se o buffer contém um arquivo válido
   */
  static validateFileBuffer(buffer: Buffer, fileType: string): boolean {
    if (!buffer || buffer.length === 0) {
      return false;
    }

    // Validação básica por magic numbers
    const magicNumbers = {
      pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
      doc: [0xD0, 0xCF, 0x11, 0xE0], // DOC
      docx: [0x50, 0x4B, 0x03, 0x04], // DOCX (ZIP)
    };

    if (fileType.includes('pdf')) {
      return buffer.slice(0, 4).equals(Buffer.from(magicNumbers.pdf));
    }

    return true; // Para TXT e outros, confiar no MIME type
  }

  /**
   * Extrai preview do texto (primeiros N caracteres)
   */
  static getTextPreview(text: string, maxLength: number = 500): string {
    if (text.length <= maxLength) {
      return text;
    }
    
    // Cortar no último espaço antes do limite
    const cutIndex = text.lastIndexOf(' ', maxLength);
    return text.substring(0, cutIndex > 0 ? cutIndex : maxLength) + '...';
  }
}
