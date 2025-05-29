import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Settings, Briefcase, Upload, FileText, CheckCircle, Type } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Project } from '@shared/schema';

interface ProjectSelectorProps {
  selectedProject: Project | null;
  onProjectChange: (project: Project | null) => void;
  onCreateProject: () => void;
  onEditProject: (project: Project) => void;
}

export function ProjectSelector({ 
  selectedProject, 
  onProjectChange, 
  onCreateProject, 
  onEditProject 
}: ProjectSelectorProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showTextDialog, setShowTextDialog] = useState(false);
  const [mpmpText, setMpmpText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/projects');
      if (response.ok) {
        const projectsData: Project[] = await response.json();
        setProjects(projectsData);
        
        // Auto-select first project if none selected
        if (!selectedProject && projectsData.length > 0) {
          onProjectChange(projectsData[0]);
        }
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar projetos",
        description: "Não foi possível carregar a lista de projetos.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMPMPUpload = async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/projects/upload-mpmp', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Falha no upload do arquivo');
      }

      const result = await response.json();
      
      toast({
        title: "MPMP processado com sucesso!",
        description: `Projeto "${result.name}" criado automaticamente a partir do manual.`,
      });

      // Recarregar projetos e selecionar o novo
      await loadProjects();
      onProjectChange(result);

    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar o arquivo MPMP. Verifique o formato.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleMPMPUpload(file);
    }
  };

  const handleTextMPMP = async () => {
    if (!mpmpText.trim()) {
      toast({
        title: "Texto vazio",
        description: "Por favor, cole o conteúdo do MPMP antes de processar.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const response = await fetch('/api/projects/process-mpmp-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: mpmpText }),
      });

      if (!response.ok) {
        throw new Error('Falha no processamento do texto');
      }

      const result = await response.json();
      
      toast({
        title: "MPMP processado com sucesso!",
        description: `Projeto "${result.name}" criado automaticamente a partir do texto.`,
      });

      // Recarregar projetos e selecionar o novo
      await loadProjects();
      onProjectChange(result);
      setShowTextDialog(false);
      setMpmpText('');

    } catch (error) {
      toast({
        title: "Erro no processamento",
        description: "Não foi possível processar o texto MPMP. Verifique o conteúdo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleProjectSelect = (projectId: string) => {
    if (projectId === 'none') {
      onProjectChange(null);
      return;
    }
    
    const project = projects.find(p => p.id.toString() === projectId);
    if (project) {
      onProjectChange(project);
    }
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-500" />
          Projeto Ativo
        </CardTitle>
        <p className="text-sm text-gray-600">
          Selecione o projeto (MPMP) para personalizar a geração de conteúdo
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Project Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Projeto Atual
          </label>
          <Select
            value={selectedProject?.id.toString() || 'none'}
            onValueChange={handleProjectSelect}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Selecione um projeto..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Sem projeto específico</SelectItem>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id.toString()}>
                  <div className="flex items-center justify-between w-full">
                    <span>{project.name}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {project.mainSpecialty || 'Especialidade não definida'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected Project Info */}
        {selectedProject && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-blue-900">{selectedProject.name}</h4>
                {selectedProject.mainSpecialty && (
                  <p className="text-sm text-blue-700 mt-1">
                    Especialidade: {selectedProject.mainSpecialty}
                  </p>
                )}
                {selectedProject.purpose && (
                  <p className="text-xs text-blue-600 mt-2">
                    Propósito: {selectedProject.purpose}
                  </p>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditProject(selectedProject)}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <div className="flex gap-2">
            <Button
              onClick={onCreateProject}
              className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:shadow-lg transition-all"
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Projeto
            </Button>
            
            {selectedProject && (
              <Button
                variant="outline"
                onClick={() => onEditProject(selectedProject)}
                size="sm"
                className="border-gray-300 hover:border-blue-400"
              >
                <Settings className="w-4 h-4 mr-2" />
                Configurar MPMP
              </Button>
            )}
          </div>
          
          {/* Upload MPMP Section */}
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Upload de MPMP Pronto</span>
            </div>
            <p className="text-xs text-gray-600 mb-3">
              Faça upload do seu Manual de Posicionamento já finalizado para criar automaticamente um projeto com todos os dados estratégicos
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                    Processando MPMP...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload de Arquivo
                  </>
                )}
              </Button>
              
              <Dialog open={showTextDialog} onOpenChange={setShowTextDialog}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full"
                    disabled={isUploading}
                  >
                    <Type className="w-4 h-4 mr-2" />
                    Colar Texto/Markdown
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh]">
                  <DialogHeader>
                    <DialogTitle>Colar Conteúdo do MPMP</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Cole aqui o conteúdo completo do seu Manual de Posicionamento de Marca Pessoal. 
                      Suporta texto simples, Markdown e conteúdo copiado de documentos.
                    </p>
                    <Textarea
                      placeholder="Cole o conteúdo do MPMP aqui..."
                      value={mpmpText}
                      onChange={(e) => setMpmpText(e.target.value)}
                      className="min-h-[400px] font-mono text-sm"
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {mpmpText.length} caracteres
                      </span>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowTextDialog(false);
                            setMpmpText('');
                          }}
                          disabled={isUploading}
                        >
                          Cancelar
                        </Button>
                        <Button
                          onClick={handleTextMPMP}
                          disabled={isUploading || !mpmpText.trim()}
                        >
                          {isUploading ? (
                            <>
                              <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                              Processando...
                            </>
                          ) : (
                            'Processar MPMP'
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="flex items-center gap-1 mt-2">
              <CheckCircle className="w-3 h-3 text-green-500" />
              <span className="text-xs text-gray-500">
                Suporta PDF, Word e texto
              </span>
            </div>
          </div>
        </div>

        {/* Projects Summary */}
        <div className="pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Total de Projetos</span>
            <span className="font-medium">{projects.length}</span>
          </div>
          
          {projects.length === 0 && !isLoading && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 mb-2">
                Nenhum projeto criado ainda
              </p>
              <p className="text-xs text-gray-400">
                Crie seu primeiro MPMP para personalizar o conteúdo
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}