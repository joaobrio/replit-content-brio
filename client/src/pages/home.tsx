import { ContentGenerator } from '@/components/content-generator';
import { HistorySidebar } from '@/components/history-sidebar';
import { KnowledgeUpload } from '@/components/knowledge-upload';
import { Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function Home() {
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
                <span>Claude 3 Sonnet</span>
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
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generator">Gerador de Conteúdo</TabsTrigger>
                <TabsTrigger value="knowledge">Base de Conhecimento</TabsTrigger>
              </TabsList>
              
              <TabsContent value="generator">
                <ContentGenerator />
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
