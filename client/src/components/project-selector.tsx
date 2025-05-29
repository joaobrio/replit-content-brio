import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Settings, Briefcase } from 'lucide-react';
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