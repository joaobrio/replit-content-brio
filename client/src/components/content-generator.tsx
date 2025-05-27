import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, Target, Heart, Lightbulb, Crosshair } from 'lucide-react';
import { useBrioStore } from '@/lib/zustand-store';
import { OBJECTIVES } from '@/lib/magnetic-codes';
import { GeneratedContentCard } from './generated-content-card';
import { useToast } from '@/hooks/use-toast';

export function ContentGenerator() {
  const [topic, setTopic] = useState('');
  const { 
    isGenerating, 
    selectedObjective, 
    setSelectedObjective, 
    generateContent, 
    generatedContent 
  } = useBrioStore();
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast({
        title: "Tema obrigatório",
        description: "Por favor, descreva o tema do seu conteúdo.",
        variant: "destructive",
      });
      return;
    }

    try {
      await generateContent(topic.trim(), selectedObjective || 'captar');
      setTopic('');
      setSelectedObjective(null);
    } catch (error) {
      toast({
        title: "Erro na geração",
        description: error instanceof Error ? error.message : "Erro ao gerar conteúdo",
        variant: "destructive",
      });
    }
  };

  const getObjectiveIcon = (objective: string) => {
    const icons = {
      captar: Target,
      conectar: Heart,
      convencer: Lightbulb,
      converter: Crosshair,
    };
    return icons[objective as keyof typeof icons] || Target;
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
        <CardHeader>
          <CardTitle className="text-xl font-bold text-gray-900">
            Gerador de Conteúdo Magnético
          </CardTitle>
          <p className="text-gray-600">
            Descreva o tema que deseja abordar e receba 3 variações usando os 8 Códigos Magnéticos
          </p>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Topic Input */}
          <div>
            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
              Descreva o tema do seu conteúdo
            </label>
            <Textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Ex: Como reduzir ansiedade sem medicamentos usando técnicas de respiração..."
              className="w-full min-h-[80px] resize-none border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isGenerating}
            />
          </div>

          {/* Objective Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Objetivo (opcional)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(OBJECTIVES).map(([key, obj]) => {
                const Icon = getObjectiveIcon(key);
                const isSelected = selectedObjective === key;
                
                return (
                  <Button
                    key={key}
                    variant={isSelected ? "default" : "outline"}
                    className={`p-3 h-auto flex flex-col items-center space-y-1 transition-all ${
                      isSelected 
                        ? 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600' 
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                    onClick={() => setSelectedObjective(isSelected ? null : key)}
                    disabled={isGenerating}
                  >
                    <Icon className="w-5 h-5" />
                    <div className="text-sm font-medium">{obj.name}</div>
                    <div className="text-xs opacity-75">{obj.description}</div>
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !topic.trim()}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Gerando conteúdo magnético...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Gerar 3 Variações de Conteúdo
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isGenerating && (
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Criando conteúdo magnético...
              </h3>
              <p className="text-gray-600">
                Analisando objetivo e selecionando os melhores códigos
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Results */}
      {generatedContent && !isGenerating && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Conteúdo Gerado ✨
            </h2>
            <p className="text-gray-600">
              3 variações usando os códigos mais eficazes para seu objetivo
            </p>
          </div>

          <div className="space-y-6">
            {generatedContent.variations.map((variation) => (
              <GeneratedContentCard key={variation.id} variation={variation} />
            ))}
          </div>

          {/* Generation Metrics */}
          <Card className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-blue-500">
                    {(generatedContent.generationTime / 1000).toFixed(1)}s
                  </div>
                  <div className="text-sm text-gray-600">Tempo de Geração</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-purple-500">
                    {generatedContent.variations.length}
                  </div>
                  <div className="text-sm text-gray-600">Variações Criadas</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-500">
                    97%
                  </div>
                  <div className="text-sm text-gray-600">Precisão IA</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-orange-500">
                    {generatedContent.tokensUsed.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Tokens Usados</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!generatedContent && !isGenerating && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Pronto para criar conteúdo magnético?
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Descreva seu tema acima e deixe a IA criar 3 variações poderosas usando os Códigos Magnéticos mais eficazes.
          </p>
        </div>
      )}
    </div>
  );
}
