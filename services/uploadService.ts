import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
  secure: true
});

interface UploadOptions {
  userId?: string;
  fileName?: string;
  projectName?: string;
  tags?: string[];
}

interface UploadResult {
  success: boolean;
  fileId: string;
  url: string;
  size: number;
  format: string;
  createdAt: string;
  etag?: string;
}

interface CloudinaryFile {
  id: string;
  url: string;
  size: number;
  format: string;
  createdAt: string;
  metadata?: any;
}

export class UploadService {
  /**
   * Upload de arquivo para Cloudinary
   */
  static async uploadFile(fileBuffer: Buffer, options: UploadOptions = {}): Promise<UploadResult> {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        resource_type: 'auto' as const,
        folder: `brio-ia/mpmp/${options.userId || 'general'}`,
        public_id: options.fileName || `file_${Date.now()}`,
        overwrite: false,
        tags: options.tags || ['mpmp'],
        context: {
          user_id: options.userId,
          project_name: options.projectName,
          uploaded_at: new Date().toISOString()
        }
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Erro no upload:', error);
            reject(error);
          } else if (result) {
            resolve({
              success: true,
              fileId: result.public_id,
              url: result.secure_url,
              size: result.bytes,
              format: result.format,
              createdAt: result.created_at,
              etag: result.etag
            });
          }
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  /**
   * Deletar arquivo do Cloudinary
   */
  static async deleteFile(publicId: string): Promise<{ success: boolean }> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { success: result.result === 'ok' };
    } catch (error) {
      console.error('Erro ao deletar:', error);
      throw error;
    }
  }

  /**
   * Obter URL otimizada com transformações
   */
  static getOptimizedUrl(publicId: string, transformations: any = {}): string {
    return cloudinary.url(publicId, {
      secure: true,
      quality: 'auto',
      fetch_format: 'auto',
      ...transformations
    });
  }

  /**
   * Listar arquivos de um usuário
   */
  static async listUserFiles(userId: string): Promise<CloudinaryFile[]> {
    try {
      const result = await cloudinary.search
        .expression(`folder:brio-ia/mpmp/${userId}`)
        .sort_by('created_at', 'desc')
        .max_results(100)
        .execute();

      return result.resources.map(file => ({
        id: file.public_id,
        url: file.secure_url,
        size: file.bytes,
        format: file.format,
        createdAt: file.created_at,
        metadata: file.context
      }));
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }

  /**
   * Buscar detalhes de um arquivo específico
   */
  static async getFileDetails(publicId: string): Promise<CloudinaryFile | null> {
    try {
      const result = await cloudinary.api.resource(publicId, {
        context: true,
        tags: true
      });

      return {
        id: result.public_id,
        url: result.secure_url,
        size: result.bytes,
        format: result.format,
        createdAt: result.created_at,
        metadata: result.context
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do arquivo:', error);
      return null;
    }
  }
}
