import pdfParse from 'pdf-parse';
import fs from 'fs/promises';
import { UploadService } from './uploadService';

interface ExtractionResult {
  text: string;
  pageCount?: number;
  metadata?: any;
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
            metadata: { warning: 'Extração básica de DOC/DOCX' }
          };
          
        default:
          throw new Error(`Tipo de arquivo não suportado: ${fileType}`);
      }
    } catch (error) {
      console.error('Erro ao extrair texto:', error);
      throw new Error(`Falha na extração de texto: ${error.message}`);
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
}
