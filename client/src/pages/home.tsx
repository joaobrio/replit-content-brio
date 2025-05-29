import { useState } from 'react';
import { ContentGenerator } from '@/components/content-generator';
import { HistorySidebar } from '@/components/history-sidebar';
import { KnowledgeUpload } from '@/components/knowledge-upload';
import { ProjectSelector } from '@/components/project-selector';
import { ProjectWizard } from '@/components/project-wizard';
import { EditorialCalendar } from '@/components/editorial-calendar';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm sm:text-base">B</span>
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">BRIO.IA</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Conteúdo Magnético</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="hidden lg:inline">Claude 3.7 Sonnet</span>
                <span className="lg:hidden">Claude</span>
              </div>
              <div className="hidden sm:flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden lg:inline">Tempo médio: 2.1s</span>
                <span className="lg:hidden">2.1s</span>
              </div>
              <Button variant="ghost" size="sm" className="w-8 h-8 sm:w-10 sm:h-10">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* History Sidebar - Hidden on mobile, shown at bottom */}
          <div className="hidden lg:block lg:col-span-1">
            <HistorySidebar />
          </div>
          
          {/* Main Content Area */}
          <div className="col-span-1 lg:col-span-3">
            <Tabs defaultValue="generator" className="space-y-4 sm:space-y-6">
              {/* Mobile-optimized tabs with horizontal scroll */}
              <div className="overflow-x-auto scrollbar-hide">
                <TabsList className="grid w-max grid-cols-5 min-w-[480px] sm:min-w-0 sm:w-full gap-1">
                  <TabsTrigger value="generator" className="text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                    <span className="hidden sm:inline">Gerador de Conteúdo</span>
                    <span className="sm:hidden">Gerador</span>
                  </TabsTrigger>
                  <TabsTrigger value="calendar" className="text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                    <span className="hidden sm:inline">Calendário Editorial</span>
                    <span className="sm:hidden">Calendário</span>
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="projects" className="text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                    <span className="hidden sm:inline">Projetos MPMP</span>
                    <span className="sm:hidden">Projetos</span>
                  </TabsTrigger>
                  <TabsTrigger value="knowledge" className="text-xs sm:text-sm px-2 sm:px-4 whitespace-nowrap">
                    <span className="hidden sm:inline">Base de Conhecimento</span>
                    <span className="sm:hidden">Base</span>
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="generator" className="mt-4 sm:mt-6">
                <ContentGenerator />
              </TabsContent>
              
              <TabsContent value="calendar" className="mt-4 sm:mt-6">
                <EditorialCalendar selectedProject={selectedProject} />
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-4 sm:mt-6">
                <AnalyticsDashboard selectedProject={selectedProject} />
              </TabsContent>
              
              <TabsContent value="projects" className="mt-4 sm:mt-6">
                <ProjectSelector
                  selectedProject={selectedProject}
                  onProjectChange={setSelectedProject}
                  onCreateProject={handleCreateProject}
                  onEditProject={handleEditProject}
                />
              </TabsContent>
              
              <TabsContent value="knowledge" className="mt-4 sm:mt-6">
                <KnowledgeUpload />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Mobile History Section */}
        <div className="lg:hidden mt-6 sm:mt-8">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-base font-semibold text-gray-900">Histórico Recente</h3>
            </div>
            <div className="p-4">
              <HistorySidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
