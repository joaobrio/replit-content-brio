import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';
import { type Project } from '@shared/schema';

interface AnalyticsDashboardProps {
  selectedProject: Project | null;
}

export function AnalyticsDashboard({ selectedProject }: AnalyticsDashboardProps) {
  return (
    <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
          <TrendingUp className="w-6 h-6 text-purple-500" />
          Analytics (Em Breve)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
              <span className="text-4xl">📊</span>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Analytics Poderosos Chegando em Breve!
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Estamos preparando um dashboard completo para você acompanhar a performance 
            dos seus conteúdos magnéticos no Instagram. Métricas detalhadas, insights 
            estratégicos e otimizações baseadas em dados reais.
          </p>
          {selectedProject ? (
            <div className="bg-purple-100 text-purple-800 px-4 py-2 rounded-lg inline-block">
              <p className="text-sm font-medium">
                Projeto Selecionado: {selectedProject.name}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              Selecione um projeto MPMP para visualizar os analytics quando disponíveis
            </p>
          )}
          <div className="mt-8 text-sm text-gray-500">
            <p>Por enquanto, foque no que realmente importa:</p>
            <p className="font-semibold text-purple-600 mt-2">
              Criar conteúdos magnéticos que conectam e convertem! 🚀
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}