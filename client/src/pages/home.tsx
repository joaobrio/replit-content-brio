import { useState } from 'react';
import { ContentGenerator } from '@/components/content-generator';
import { HistorySidebar } from '@/components/history-sidebar';
import { KnowledgeUpload } from '@/components/knowledge-upload';
import { ProjectSelector } from '@/components/project-selector';
import { ProjectWizard } from '@/components/project-wizard';
import { EditorialCalendar } from '@/components/editorial-calendar';
import { Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { type Project, type InsertProject } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();

  const handleCreateProject = () => {
    setEditingProject(null);
    setShowProjectWizard(true);
  };

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowProjectWizard(true);
  };

  const handleSaveProject = async (projectData: InsertProject) => {
    try {
      const url = editingProject ? `/api/projects/${editingProject.id}` : '/api/projects';
      const method = editingProject ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar projeto');
      }

      const savedProject: Project = await response.json();
      
      setSelectedProject(savedProject);
      setShowProjectWizard(false);
      setEditingProject(null);

      toast({
        title: editingProject ? "Projeto atualizado!" : "Projeto criado!",
        description: `${savedProject.name} foi ${editingProject ? 'atualizado' : 'criado'} com sucesso.`,
      });
    } catch (error) {
      toast({
        title: "Erro ao salvar projeto",
        description: "Não foi possível salvar o projeto. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (showProjectWizard) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <ProjectWizard
          project={editingProject || undefined}
          onSave={handleSaveProject}
          onCancel={() => {
            setShowProjectWizard(false);
            setEditingProject(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <span className="text-xl font-bold text-gray-900">BRIO.IA</span>
              </div>
              <div className="hidden md:block">
                <span className="text-sm text-gray-500">Gerador de Conteúdo Magnético</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Claude 3.7 Sonnet</span>
              </div>
              <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-500">
                <Clock className="w-4 h-4" />
                <span>Tempo médio: 2.1s</span>
              </div>
              <Button variant="ghost" size="sm">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-120px)]">
          {/* History Sidebar */}
          <div className="lg:col-span-1">
            <HistorySidebar />
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="generator" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="generator">Gerador de Conteúdo</TabsTrigger>
                <TabsTrigger value="calendar">Calendário Editorial</TabsTrigger>
                <TabsTrigger value="projects">Projetos MPMP</TabsTrigger>
                <TabsTrigger value="knowledge">Base de Conhecimento</TabsTrigger>
              </TabsList>
              
              <TabsContent value="generator">
                <ContentGenerator />
              </TabsContent>
              
              <TabsContent value="calendar">
                <EditorialCalendar selectedProject={selectedProject} />
              </TabsContent>
              
              <TabsContent value="projects">
                <ProjectSelector
                  selectedProject={selectedProject}
                  onProjectChange={setSelectedProject}
                  onCreateProject={handleCreateProject}
                  onEditProject={handleEditProject}
                />
              </TabsContent>
              
              <TabsContent value="knowledge">
                <KnowledgeUpload />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
