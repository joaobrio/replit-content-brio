import { useState } from 'react';
import { ContentGenerator } from '@/components/content-generator';
import { HistorySidebar } from '@/components/history-sidebar';
import { KnowledgeUpload } from '@/components/knowledge-upload';
import { ProjectSelector } from '@/components/project-selector';
import { ProjectWizard } from '@/components/project-wizard';
import { EditorialCalendar } from '@/components/editorial-calendar';
import { AnalyticsDashboard } from '@/components/analytics-dashboard';
import { SuccessStories } from '@/components/success-stories';
import { StoriesModule } from '@/components/stories-module';
import { 
  Clock, 
  Settings, 
  Sparkles, 
  Calendar, 
  BarChart3, 
  Trophy, 
  Video, 
  Upload,
  Folder,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { type Project, type InsertProject, type User } from '@shared/schema';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const navigation = [
  {
    id: 'generator',
    name: 'Gerador de Conteúdo',
    icon: Sparkles,
    description: 'Crie posts magnéticos usando os 8 Códigos'
  },
  {
    id: 'calendar',
    name: 'Calendário Editorial',
    icon: Calendar,
    description: 'Planeje seu conteúdo estrategicamente'
  },
  {
    id: 'analytics',
    name: 'Analytics',
    icon: BarChart3,
    description: 'Analise performance dos posts'
  },
  {
    id: 'stories-module',
    name: 'Stories Magnéticos',
    icon: Video,
    description: 'Crie stories com metodologia BRIO'
  },
  {
    id: 'stories',
    name: 'Cases de Sucesso',
    icon: Trophy,
    description: 'Inspire-se com histórias reais'
  },
  {
    id: 'projects',
    name: 'Projetos',
    icon: Folder,
    description: 'Gerencie seus projetos MPMP'
  },
  {
    id: 'knowledge',
    name: 'Base de Conhecimento',
    icon: Upload,
    description: 'Envie materiais de referência'
  }
];

export default function Home() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectWizard, setShowProjectWizard] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [activeTab, setActiveTab] = useState('generator');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
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
        title: "Erro",
        description: "Falha ao salvar projeto. Tente novamente.",
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

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'generator':
        return <ContentGenerator />;
      case 'calendar':
        return <EditorialCalendar selectedProject={selectedProject} />;
      case 'analytics':
        return <AnalyticsDashboard selectedProject={selectedProject} />;
      case 'stories-module':
        return <StoriesModule selectedProject={selectedProject} />;
      case 'stories':
        return <SuccessStories />;
      case 'projects':
        return (
          <ProjectSelector
            selectedProject={selectedProject}
            onProjectChange={setSelectedProject}
            onCreateProject={handleCreateProject}
            onEditProject={handleEditProject}
          />
        );
      case 'knowledge':
        return <KnowledgeUpload />;
      default:
        return <ContentGenerator />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-gray-900">
            BRIO<span className="text-purple-600">.IA</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          {user && (
            <>
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user.profileImageUrl || undefined} />
                  <AvatarFallback>
                    <UserIcon className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user.firstName || user.email || 'Usuário'}
                  </p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('brioia_user');
                  window.location.reload();
                }}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sair</span>
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className={cn(
          "bg-white border-r border-gray-200 flex flex-col transition-all duration-300",
          sidebarCollapsed ? "w-16" : "w-72"
        )}>
          {/* Header */}
          <div className={cn("border-b border-gray-100", sidebarCollapsed ? "p-2" : "p-4")}>
            {sidebarCollapsed ? (
              <div className="flex justify-center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(false)}
                  className="h-8 w-8 p-0"
                  title="Expandir menu"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                    <span className="text-white font-bold">B</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">BRIO.IA</h1>
                    <p className="text-sm text-gray-600">Conteúdo Magnético</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(true)}
                  className="h-8 w-8 p-0"
                  title="Minimizar menu"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-3 text-left text-sm font-medium rounded-lg transition-all duration-200",
                      isActive
                        ? "bg-purple-50 text-purple-700 border border-purple-200"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      sidebarCollapsed && "justify-center px-2"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 flex-shrink-0", isActive ? "text-purple-600" : "text-gray-400")} />
                    {!sidebarCollapsed && (
                      <div className="min-w-0 flex-1">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {item.description}
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-100">
            <div className={cn(
              "flex items-center gap-3 text-sm text-gray-500",
              sidebarCollapsed ? "justify-center" : ""
            )}>
              <Clock className="h-4 w-4" />
              {!sidebarCollapsed && (
                <span>Última atualização: hoje</span>
              )}
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Content Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {navigation.find(item => item.id === activeTab)?.name || 'Página'}
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  {navigation.find(item => item.id === activeTab)?.description || ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <main className="flex-1 p-6 overflow-auto">
            {renderActiveContent()}
          </main>
        </div>

        {/* Right Sidebar - History (Hidden on small screens) */}
        <div className="hidden xl:block w-80 bg-white border-l border-gray-200">
          <div className="p-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Histórico Recente</h3>
          </div>
          <div className="p-4">
            <HistorySidebar />
          </div>
        </div>
      </div>
    </div>
  );
}