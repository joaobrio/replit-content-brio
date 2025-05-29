import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, FileText, PlusCircle, ArrowLeft, CheckCircle, 
  AlertCircle, Loader2, Download 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type InsertProject } from '@shared/schema';

interface MPMPImportProps {
  onImportComplete: (projectData: Partial<InsertProject>) => void;
  onCreateNew: () => void;
  onCancel: () => void;
}

export function MPMPImport({ onImportComplete, onCreateNew, onCancel }: MPMPImportProps) {
  const [importMode, setImportMode] = useState<'pdf' | 'manual' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<Partial<InsertProject> | null>(null);
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

  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione um arquivo PDF.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch('/api/mpmp/import-pdf', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error('Falha ao processar PDF');
      }

      const result = await response.json();
      setExtractedData(result.projectData);
      
      toast({
        title: "PDF processado com sucesso!",
        description: "Os dados foram extraídos e estão prontos para revisão.",
      });

    } catch (error) {
      console.error('Error processing PDF:', error);
      toast({
        title: "Erro ao processar PDF",
        description: "Não foi possível extrair os dados do PDF. Tente novamente ou use a importação manual.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const addToArray = (field: string, value: string) => {
    if (!value.trim()) return;
    
    setManualData(prev => ({
      ...prev,
      [field]: [...(prev[field as keyof typeof prev] as string[] || []), value.trim()]
    }));
  };

  const removeFromArray = (field: string, index: number) => {
    setManualData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  if (importMode === 'pdf') {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setImportMode(null)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold">Importar MPMP via PDF</h2>
        </div>

        {!extractedData ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                Upload do PDF de Respostas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-lg font-medium">Faça upload do PDF com as respostas do cliente</p>
                  <p className="text-sm text-gray-600">
                    A IA irá extrair automaticamente as informações e preencher o MPMP
                  </p>
                </div>
                
                <div className="mt-6">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handlePdfUpload}
                    className="hidden"
                    id="pdf-upload"
                    disabled={isProcessing}
                  />
                  <label htmlFor="pdf-upload">
                    <Button asChild disabled={isProcessing}>
                      <span className="cursor-pointer">
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Selecionar PDF
                          </>
                        )}
                      </span>
                    </Button>
                  </label>
                </div>

                {isProcessing && (
                  <div className="mt-6 space-y-2">
                    <Progress value={uploadProgress} className="w-full" />
                    <p className="text-sm text-gray-600">
                      {uploadProgress < 50 ? 'Fazendo upload...' : 
                       uploadProgress < 90 ? 'Processando com IA...' : 
                       'Finalizando...'}
                    </p>
                  </div>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Dica:</p>
                    <p className="text-blue-700">
                      O PDF deve conter as respostas do questionário MPMP. A IA consegue extrair 
                      informações de formulários estruturados, entrevistas transcritas ou documentos 
                      com as respostas organizadas.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                Dados Extraídos com Sucesso
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800">
                  Os dados foram extraídos do PDF. Revise as informações abaixo e confirme para continuar.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Projeto</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{extractedData.name || 'Não especificado'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Especialidade Principal</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{extractedData.mainSpecialty || 'Não especificado'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-1">Propósito</label>
                  <p className="text-gray-900 bg-gray-50 p-2 rounded">{extractedData.purpose || 'Não especificado'}</p>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button onClick={() => onImportComplete(extractedData)} className="flex-1">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirmar e Continuar
                </Button>
                <Button variant="outline" onClick={() => setExtractedData(null)}>
                  Processar Outro PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
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

        {/* Upload PDF */}
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setImportMode('pdf')}>
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-lg">Importar via PDF</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <p className="text-gray-600 text-sm">
              Faça upload de um PDF com as respostas do cliente e deixe a IA extrair os dados automaticamente.
            </p>
            <div className="space-y-1 text-xs text-gray-500">
              <p>✓ Processamento automático com IA</p>
              <p>✓ Extração inteligente de dados</p>
              <p>✓ Ideal para questionários preenchidos</p>
            </div>
            <Button className="w-full mt-4" variant="outline">
              <Upload className="w-4 h-4 mr-2" />
              Upload PDF
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