const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// Configurar Cloudinary com suas credenciais
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

class UploadService {
  static async uploadFile(fileBuffer, options = {}) {
    return new Promise((resolve, reject) => {
      const uploadOptions = {
        resource_type: 'auto',
        folder: `brio-ia/mpmp/${options.userId || 'general'}`,
        public_id: options.fileName || `file_${Date.now()}`,
        overwrite: false
      };

      const uploadStream = cloudinary.uploader.upload_stream(
        uploadOptions,
        (error, result) => {
          if (error) {
            console.error('Erro no upload:', error);
            reject(error);
          } else {
            resolve({
              success: true,
              fileId: result.public_id,
              url: result.secure_url,
              size: result.bytes,
              format: result.format,
              createdAt: result.created_at
            });
          }
        }
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }

  static async deleteFile(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return { success: result.result === 'ok' };
    } catch (error) {
      console.error('Erro ao deletar:', error);
      throw error;
    }
  }

  static async listUserFiles(userId) {
    try {
      const result = await cloudinary.search
        .expression(`folder:brio-ia/mpmp/${userId}`)
        .sort_by('created_at', 'desc')
        .max_results(30)
        .execute();

      return result.resources.map(file => ({
        id: file.public_id,
        url: file.secure_url,
        size: file.bytes,
        format: file.format,
        createdAt: file.created_at
      }));
    } catch (error) {
      console.error('Erro ao listar arquivos:', error);
      throw error;
    }
  }
}

module.exports = UploadService;
