import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, FileText, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
}

export function KnowledgeUpload() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validar tipo de arquivo
    const allowedTypes = ['application/pdf', 'text/markdown', 'text/plain'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.md')) {
      toast({
        title: "Tipo de arquivo não suportado",
        description: "Por favor, envie apenas arquivos PDF ou Markdown (.md)",
        variant: "destructive",
      });
      return;
    }

    // Validar tamanho (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O arquivo deve ter no máximo 10MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/knowledge/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha no upload do arquivo');
      }

      const result = await response.json();

      const newFile: UploadedFile = {
        id: result.id,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      };

      setUploadedFiles(prev => [...prev, newFile]);

      toast({
        title: "Arquivo carregado com sucesso!",
        description: `${file.name} foi adicionado à base de conhecimento`,
      });

      // Limpar o input
      event.target.value = '';

    } catch (error) {
      toast({
        title: "Erro no upload",
        description: "Não foi possível carregar o arquivo. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch(`/api/knowledge/${fileId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao remover arquivo');
      }

      setUploadedFiles(prev => prev.filter(file => file.id !== fileId));

      toast({
        title: "Arquivo removido",
        description: "O arquivo foi removido da base de conhecimento",
      });

    } catch (error) {
      toast({
        title: "Erro ao remover",
        description: "Não foi possível remover o arquivo. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, name: string) => {
    if (type === 'application/pdf') return '📄';
    if (type === 'text/markdown' || name.endsWith('.md')) return '📝';
    return '📄';
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Base de Conhecimento
        </CardTitle>
        <p className="text-sm text-gray-600">
          Carregue documentos PDF ou Markdown para enriquecer a base de conhecimento do BRIO.IA
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Upload Area */}
        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.md,.markdown"
            onChange={handleFileUpload}
            disabled={isUploading}
          />
          <label
            htmlFor="file-upload"
            className={`cursor-pointer flex flex-col items-center space-y-3 ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">
                {isUploading ? 'Carregando arquivo...' : 'Clique para carregar arquivo'}
              </p>
              <p className="text-xs text-gray-500">
                PDF ou Markdown (máx. 10MB)
              </p>
            </div>
          </label>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Como funciona:</p>
              <ul className="text-xs space-y-1">
                <li>• Os documentos são processados e integrados ao Assistant</li>
                <li>• O conteúdo gerado será baseado nesses materiais</li>
                <li>• Formatos aceitos: PDF e Markdown (.md)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Uploaded Files List */}
        {uploadedFiles.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Arquivos Carregados:</h4>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{getFileIcon(file.type, file.name)}</span>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {uploadedFiles.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">
              Nenhum arquivo carregado ainda
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}