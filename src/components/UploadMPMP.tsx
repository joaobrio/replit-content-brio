import React, { useState, useCallback } from 'react';
import { Upload, FileText, Loader2, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface UploadStatus {
  stage: 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'creating' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

interface UploadResult {
  arquivo: {
    id: string;
    url: string;
    size: number;
    format: string;
    pageCount?: number;
  };
  projeto: {
    id: number;
    name: string;
    specialty?: string;
    purpose?: string;
  };
  processamento: {
    caracteresExtraidos: number;
    tempoTotal: number;
  };
}

interface UploadMPMPProps {
  onProjectCreated?: (project: any) => void;
  userId?: string;
}

export function UploadMPMP({ onProjectCreated, userId = 'demo-user' }: UploadMPMPProps) {
  const [status, setStatus] = useState<UploadStatus>({
    stage: 'idle',
    progress: 0,
    message: ''
  });
  const [result, setResult] = useState<UploadResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const updateStatus = (stage: UploadStatus['stage'], progress: number, message: string) => {
    setStatus({ stage, progress, message });
  };

  const handleFile = async (file: File) => {
    // Validações
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setStatus({
        stage: 'error',
        progress: 0,
        message: 'Arquivo muito grande. Máximo: 10MB',
        error: 'size'
      });
      return;
    }

    const allowedTypes = ['application/pdf', 'text/plain', 'application/msword', 
                         'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setStatus({
        stage: 'error',
        progress: 0,
        message: 'Tipo não suportado. Use PDF, DOC, DOCX ou TXT',
        error: 'type'
      });
      return;
    }

    // Preparar FormData
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('userId', userId);
    formData.append('projectName', file.name.split('.')[0]);
    formData.append('startTime', Date.now().toString());
    formData.append('deleteOnError', 'true'); // Deletar do Cloudinary se falhar

    try {
      // Iniciar processamento
      updateStatus('uploading', 15, 'Enviando arquivo para a nuvem...');
      
      const response = await fetch('/api/mpmp/upload-e-processar', {
        method: 'POST',
        body: formData
      });

      // Simular progresso visual durante processamento
      const progressSteps = [
        { stage: 'uploading' as const, progress: 30, message: 'Upload concluído...', delay: 500 },
        { stage: 'extracting' as const, progress: 45, message: 'Extraindo texto do documento...', delay: 1000 },
        { stage: 'analyzing' as const, progress: 65, message: 'Analisando com inteligência artificial...', delay: 1500 },
        { stage: 'creating' as const, progress: 85, message: 'Criando projeto personalizado...', delay: 500 }
      ];

      // Executar steps de progresso
      for (const step of progressSteps) {
        setTimeout(() => updateStatus(step.stage, step.progress, step.message), step.delay);
      }

      // Aguardar resposta
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro no processamento');
      }

      // Sucesso!
      setTimeout(() => {
        updateStatus('complete', 100, 'Projeto criado com sucesso!');
        setResult(data);
        
        // Callback opcional
        if (onProjectCreated && data.projeto) {
          onProjectCreated(data.projeto);
        }
      }, 3000);

    } catch (error) {
      console.error('Erro:', error);
      setStatus({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        error: 'processing'
      });
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const resetUpload = () => {
    setStatus({ stage: 'idle', progress: 0, message: '' });
    setResult(null);
  };

  const getStageIcon = () => {
    switch (status.stage) {
      case 'uploading': return <Upload className="h-5 w-5" />;
      case 'extracting': return <FileText className="h-5 w-5" />;
      case 'analyzing': return <Loader2 className="h-5 w-5 animate-spin" />;
      case 'creating': return <ArrowRight className="h-5 w-5" />;
      default: return <Loader2 className="h-5 w-5 animate-spin" />;
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      {status.stage === 'idle' && (
        <div
          className={`border-2 border-dashed rounded-lg p-12 text-center transition-all duration-200 ${
            isDragging 
              ? 'border-primary bg-primary/5 scale-105' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Upload className="h-8 w-8 text-primary" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            Upload do seu MPMP
          </h3>
          <p className="text-sm text-muted-foreground mb-6">
            Arraste seu arquivo aqui ou clique para selecionar
            <br />
            <span className="text-xs">PDF, DOC, DOCX ou TXT • Máximo 10MB</span>
          </p>
          
          <input
            type="file"
            className="hidden"
            id="file-upload"
            accept=".pdf,.doc,.docx,.txt"
            onChange={handleInputChange}
          />
          <label htmlFor="file-upload">
            <Button className="cursor-pointer" asChild>
              <span>Selecionar Arquivo</span>
            </Button>
          </label>
        </div>
      )}

      {(status.stage !== 'idle' && status.stage !== 'complete' && status.stage !== 'error') && (
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStageIcon()}
                <span className="font-medium">{status.message}</span>
              </div>
              <span className="text-sm text-muted-foreground">{status.progress}%</span>
            </div>
            <Progress value={status.progress} className="h-2" />
          </div>

          {/* Etapas do processo */}
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className={`text-center ${status.progress >= 25 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
                status.progress >= 25 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                1
              </div>
              Upload
            </div>
            <div className={`text-center ${status.progress >= 50 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
                status.progress >= 50 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                2
              </div>
              Extração
            </div>
            <div className={`text-center ${status.progress >= 75 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
                status.progress >= 75 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                3
              </div>
              Análise IA
            </div>
            <div className={`text-center ${status.progress >= 90 ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-8 h-8 mx-auto mb-1 rounded-full flex items-center justify-center ${
                status.progress >= 90 ? 'bg-primary text-white' : 'bg-gray-200'
              }`}>
                4
              </div>
              Projeto
            </div>
          </div>
        </div>
      )}

      {status.stage === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro no processamento</AlertTitle>
          <AlertDescription>
            {status.message}
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={resetUpload}
            >
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {status.stage === 'complete' && result && (
        <div className="space-y-6">
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900">Processamento concluído!</AlertTitle>
            <AlertDescription className="text-green-800">
              Seu MPMP foi analisado e o projeto foi criado com sucesso.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Arquivo Processado
              </h4>
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tamanho:</dt>
                  <dd>{(result.arquivo.size / 1024).toFixed(1)} KB</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Formato:</dt>
                  <dd className="uppercase">{result.arquivo.format}</dd>
                </div>
                {result.arquivo.pageCount && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Páginas:</dt>
                    <dd>{result.arquivo.pageCount}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Caracteres:</dt>
                  <dd>{result.processamento.caracteresExtraidos.toLocaleString()}</dd>
                </div>
              </dl>
            </Card>

            <Card className="p-4">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Projeto Criado
              </h4>
              <dl className="space-y-1 text-sm">
                <div>
                  <dt className="text-muted-foreground">Nome:</dt>
                  <dd className="font-medium">{result.projeto.name}</dd>
                </div>
                {result.projeto.specialty && (
                  <div>
                    <dt className="text-muted-foreground">Especialidade:</dt>
                    <dd>{result.projeto.specialty}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Tempo total:</dt>
                  <dd>{(result.processamento.tempoTotal / 1000).toFixed(1)}s</dd>
                </div>
              </dl>
            </Card>
          </div>

          <div className="flex gap-3 justify-center">
            <Button onClick={resetUpload} variant="outline">
              Processar Novo Arquivo
            </Button>
            <Button 
              onClick={() => window.location.href = `/projetos/${result.projeto.id}`}
              className="gap-2"
            >
              Ver Projeto
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
