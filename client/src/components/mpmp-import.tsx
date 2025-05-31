import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Upload, FileText, PlusCircle, ArrowLeft, CheckCircle, 
  AlertCircle, Loader2, ArrowRight 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type InsertProject } from '@shared/schema';

interface MPMPImportProps {
  onImportComplete: (projectData: Partial<InsertProject>) => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

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

export function MPMPImport({ onImportComplete, onCreateNew, onCancel }: MPMPImportProps) {
  const [importMode, setImportMode] = useState<'upload' | 'manual' | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<UploadStatus>({
    stage: 'idle',
    progress: 0,
    message: ''
  });
  const [result, setResult] = useState<UploadResult | null>(null);
  const { toast } = useToast();

  // Manual import form state
  const [manualData, setManualData] = useState<Partial<InsertProject>>({
    name: '',
    purpose: '',
    values: [],
    originStory: '',
    mission: '',
    mainSpecialty: '',
    differentials: [],
    methodology: '',
    keywords: [],
    defaultBio: ''
  });

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
    formData.append('userId', 'demo-user'); // Ajustar conforme autenticação
    formData.append('projectName', file.name.split('.')[0]);
    formData.append('startTime', Date.now().toString());
    formData.append('deleteOnError', 'true');

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
        
        // Converter dados para formato esperado pelo callback
        const projectData: Partial<InsertProject> = {
          name: data.projeto.name,
          mainSpecialty: data.projeto.specialty,
          purpose: data.projeto.purpose,
          // Outros campos serão preenchidos quando buscarmos o projeto completo
        };
        
        toast({
          title: "MPMP processado com sucesso!",
          description: `Projeto "${data.projeto.name}" foi criado automaticamente.`,
        });
        
      }, 3000);

    } catch (error) {
      console.error('Erro:', error);
      setStatus({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Erro desconhecido',
        error: 'processing'
      });
      
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar o arquivo. Tente novamente ou use a importação manual.",
        variant: "destructive",
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

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

  // Tela de upload inteligente
  if (importMode === 'upload') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setImportMode(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold">Upload Inteligente de MPMP</h2>
        </div>

        <Card className="p-6">
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
                Upload Inteligente do seu MPMP
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
                  onClick={() => {
                    // Buscar dados completos do projeto e chamar callback
                    fetch(`/api/projects/${result.projeto.id}`)
                      .then(res => res.json())
                      .then(projectData => onImportComplete(projectData))
                      .catch(() => {
                        // Fallback com dados básicos
                        onImportComplete({
                          name: result.projeto.name,
                          mainSpecialty: result.projeto.specialty,
                          purpose: result.projeto.purpose
                        });
                      });
                  }}
                  className="gap-2"
                >
                  Continuar com Projeto
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900 mb-1">Como funciona o Upload Inteligente:</p>
              <ul className="text-blue-700 space-y-1">
                <li>• <strong>Upload automático:</strong> Seu arquivo é salvo na nuvem de forma segura</li>
                <li>• <strong>Extração inteligente:</strong> IA extrai texto de PDFs, DOCs e outros formatos</li>
                <li>• <strong>Análise com IA:</strong> Claude analisa o conteúdo e estrutura os dados do MPMP</li>
                <li>• <strong>Projeto pronto:</strong> MPMP completo criado automaticamente</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (importMode === 'manual') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setImportMode(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold">Importação Manual de MPMP</h2>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dados Básicos do Projeto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nome do Projeto/Cliente</label>
                <Input
                  value={manualData.name}
                  onChange={(e) => setManualData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Dr. João Silva - Cardiologista"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Especialidade Principal</label>
                <Input
                  value={manualData.mainSpecialty}
                  onChange={(e) => setManualData(prev => ({ ...prev, mainSpecialty: e.target.value }))}
                  placeholder="Ex: Cardiologia"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Propósito (Por que faz o que faz)</label>
              <Textarea
                value={manualData.purpose}
                onChange={(e) => setManualData(prev => ({ ...prev, purpose: e.target.value }))}
                placeholder="Ex: Ajudar pessoas a viverem mais e melhor através da prevenção cardiovascular..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">História de Origem</label>
              <Textarea
                value={manualData.originStory}
                onChange={(e) => setManualData(prev => ({ ...prev, originStory: e.target.value }))}
                placeholder="A história que define quem é esta pessoa profissionalmente..."
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Missão</label>
              <Textarea
                value={manualData.mission}
                onChange={(e) => setManualData(prev => ({ ...prev, mission: e.target.value }))}
                placeholder="O que quer transformar no mundo através do seu trabalho..."
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Bio Padrão para Redes Sociais</label>
              <Textarea
                value={manualData.defaultBio}
                onChange={(e) => setManualData(prev => ({ ...prev, defaultBio: e.target.value }))}
                placeholder="Bio que será usada no Instagram, LinkedIn, etc..."
                rows={3}
              />
            </div>

            <div className="flex gap-4 pt-6">
              <Button onClick={() => onImportComplete(manualData)} className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Importar Dados
              </Button>
              <Button variant="outline" onClick={() => setImportMode(null)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Como você gostaria de criar o projeto MPMP?</h2>
        <p className="text-gray-600">Escolha a opção que melhor se adequa à sua situação</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nova Criação */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onCreateNew}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PlusCircle className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="text-lg">Criar Novo MPMP</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-gray-600 text-sm">
              Construa um novo Manual de Posicionamento de Marca Pessoal do zero usando nosso questionário guiado.
            </p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>✓ Questionário completo de 20 perguntas</p>
              <p>✓ Metodologia BRIO estruturada</p>
              <p>✓ Ideal para novos clientes</p>
            </div>
            <Button className="w-full mt-4">
              Começar do Zero
            </Button>
          </CardContent>
        </Card>

        {/* Upload Inteligente */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer border-2 border-primary/20" onClick={() => setImportMode('upload')}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 relative">
              <Upload className="w-8 h-8 text-primary" />
              <div className="absolute -top-1 -right-1 bg-primary text-white text-xs px-1.5 py-0.5 rounded-full">
                NOVO
              </div>
            </div>
            <CardTitle className="text-lg text-primary">Upload Inteligente</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-gray-600 text-sm">
              Faça upload de qualquer arquivo (PDF, DOC, TXT) e nossa IA cria o MPMP automaticamente.
            </p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>✓ Upload para nuvem seguro</p>
              <p>✓ Extração automática de texto</p>
              <p>✓ Processamento com IA avançada</p>
              <p>✓ MPMP completo em minutos</p>
            </div>
            <Button className="w-full mt-4">
              <Upload className="w-4 h-4 mr-2" />
              Upload Inteligente
            </Button>
          </CardContent>
        </Card>

        {/* Importação Manual */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setImportMode('manual')}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="text-lg">Importação Manual</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-gray-600 text-sm">
              Insira manualmente os dados de um MPMP que já foi desenvolvido anteriormente.
            </p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>✓ Controle total sobre os dados</p>
              <p>✓ Formulário simplificado</p>
              <p>✓ Ideal para MPMPs existentes</p>
            </div>
            <Button className="w-full mt-4" variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Inserir Manual
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-6">
        <Button variant="ghost" onClick={onCancel}>
          Cancelar
        </Button>
      </div>
    </div>
  );
}