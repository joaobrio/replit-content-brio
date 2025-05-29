import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, RefreshCw, Download, Clock, Target, Zap, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Project } from '@shared/schema';

interface CalendarSuggestion {
  id: string;
  date: string;
  dayOfWeek: string;
  objective: 'captar' | 'conectar' | 'convencer' | 'converter';
  code: string;
  editorialLine: string;
  suggestion: string;
  preview?: string;
}

interface EditorialCalendarProps {
  selectedProject: Project | null;
}

export function EditorialCalendar({ selectedProject }: EditorialCalendarProps) {
  const [suggestions, setSuggestions] = useState<CalendarSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState<CalendarSuggestion | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { toast } = useToast();

  const objectives = {
    'captar': { icon: '🎯', color: 'bg-blue-100 text-blue-800', label: 'Captar' },
    'conectar': { icon: '💝', color: 'bg-green-100 text-green-800', label: 'Conectar' },
    'convencer': { icon: '🧠', color: 'bg-purple-100 text-purple-800', label: 'Convencer' },
    'converter': { icon: '⚡', color: 'bg-orange-100 text-orange-800', label: 'Converter' }
  };

  const generateMonthlyCalendar = async () => {
    if (!selectedProject) {
      toast({
        title: "Projeto necessário",
        description: "Selecione um projeto MPMP para gerar o calendário editorial.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/editorial-calendar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          month: currentMonth.getMonth() + 1,
          year: currentMonth.getFullYear(),
        }),
      });

      if (!response.ok) {
        throw new Error('Falha ao gerar calendário');
      }

      const calendarData: CalendarSuggestion[] = await response.json();
      setSuggestions(calendarData);

      toast({
        title: "Calendário gerado!",
        description: `${calendarData.length} sugestões criadas para ${selectedProject.name}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar calendário",
        description: "Não foi possível gerar as sugestões. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateSuggestion = async (suggestionId: string) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);
    if (!suggestion || !selectedProject) return;

    try {
      const response = await fetch('/api/editorial-calendar/regenerate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject.id,
          date: suggestion.date,
          objective: suggestion.objective,
          code: suggestion.code,
        }),
      });

      if (!response.ok) throw new Error('Falha ao regenerar');

      const newSuggestion: CalendarSuggestion = await response.json();
      setSuggestions(prev => prev.map(s => s.id === suggestionId ? newSuggestion : s));

      toast({
        title: "Sugestão regenerada!",
        description: "Nova sugestão criada com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao regenerar",
        description: "Não foi possível criar nova sugestão.",
        variant: "destructive",
      });
    }
  };

  const getMonthName = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  const changeMonth = (increment: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + increment);
    setCurrentMonth(newMonth);
    setSuggestions([]); // Clear suggestions when changing month
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <Calendar className="w-6 h-6 text-blue-500" />
            Calendário Editorial BRIO
          </CardTitle>
          <p className="text-gray-600">
            Gere sugestões mensais de conteúdo estratégico baseadas no seu MPMP e nos 8 Códigos Magnéticos
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {!selectedProject && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ Selecione um projeto MPMP na aba "Projetos MPMP" para gerar seu calendário editorial personalizado
              </p>
            </div>
          )}

          {selectedProject && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-1">Projeto Ativo: {selectedProject.name}</h4>
              <p className="text-sm text-blue-700">
                Especialidade: {selectedProject.mainSpecialty || 'Não definida'}
              </p>
            </div>
          )}

          {/* Month Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => changeMonth(-1)}
              size="sm"
            >
              ← Mês Anterior
            </Button>

            <h3 className="text-lg font-semibold text-gray-900 capitalize">
              {getMonthName(currentMonth)}
            </h3>

            <Button
              variant="outline"
              onClick={() => changeMonth(1)}
              size="sm"
            >
              Próximo Mês →
            </Button>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={generateMonthlyCalendar}
              disabled={!selectedProject || isGenerating}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-2"
            >
              {isGenerating ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Calendar className="w-4 h-4" />
              )}
              {isGenerating ? 'Gerando...' : 'Gerar Calendário'}
            </Button>

            {suggestions.length > 0 && (
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => {
                  // TODO: Implement export functionality
                  toast({
                    title: "Exportar calendário",
                    description: "Funcionalidade em desenvolvimento",
                  });
                }}
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar Grid */}
      {suggestions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suggestions.map((suggestion) => (
            <Card 
              key={suggestion.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedSuggestion(suggestion)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-gray-600">
                    {suggestion.dayOfWeek}, {new Date(suggestion.date).getDate()}
                  </div>
                  <Badge className={objectives[suggestion.objective].color}>
                    {objectives[suggestion.objective].icon} {objectives[suggestion.objective].label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="w-3 h-3 text-purple-500" />
                    <span className="font-medium">Código:</span>
                    <span className="text-gray-600">{suggestion.code}</span>
                  </div>
                  
                  <div className="flex items-start gap-2 text-sm">
                    <Target className="w-3 h-3 text-blue-500 mt-0.5" />
                    <div>
                      <span className="font-medium">Linha Editorial:</span>
                      <p className="text-gray-600 text-xs mt-1">{suggestion.editorialLine}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {suggestion.suggestion}
                  </p>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedSuggestion(suggestion);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="w-3 h-3 mr-1" />
                    Ver Completo
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      regenerateSuggestion(suggestion.id);
                    }}
                    className="text-gray-600 hover:text-gray-800"
                  >
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Regenerar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && selectedProject && !isGenerating && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">
              Calendário Vazio
            </h3>
            <p className="text-gray-500 text-center mb-4">
              Clique em "Gerar Calendário" para criar sugestões estratégicas para {getMonthName(currentMonth)}
            </p>
            <Button 
              onClick={generateMonthlyCalendar}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Gerar Primeiro Calendário
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      {selectedSuggestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{selectedSuggestion.dayOfWeek}, {new Date(selectedSuggestion.date).getDate()} de {getMonthName(currentMonth)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSuggestion(null)}
                >
                  ✕
                </Button>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge className={objectives[selectedSuggestion.objective].color}>
                  {objectives[selectedSuggestion.objective].icon} {objectives[selectedSuggestion.objective].label}
                </Badge>
                <Badge variant="outline">
                  {selectedSuggestion.code}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Linha Editorial:</h4>
                <p className="text-gray-600">{selectedSuggestion.editorialLine}</p>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-2">Sugestão de Conteúdo:</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedSuggestion.suggestion}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={() => regenerateSuggestion(selectedSuggestion.id)}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Regenerar
                </Button>
                
                <Button
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-2"
                  onClick={() => {
                    // TODO: Integrate with content generator
                    toast({
                      title: "Gerar conteúdo",
                      description: "Funcionalidade em desenvolvimento",
                    });
                  }}
                >
                  <Zap className="w-4 h-4" />
                  Gerar Conteúdo
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}