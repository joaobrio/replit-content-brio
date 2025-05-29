import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Project, StoryProject, StorySlide } from "@shared/schema";
import { STORY_FRAMEWORKS, STORY_SEQUENCES, selectBestFramework, getFrameworkPrompt } from "@/lib/story-frameworks";
import { MAGNETIC_CODES, OBJECTIVES } from "@/lib/magnetic-codes";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Wand2, 
  Eye, 
  Download,
  Calendar,
  BarChart3,
  BookOpen,
  Sparkles,
  Clock,
  Target,
  Zap
} from "lucide-react";

interface StoriesModuleProps {
  selectedProject: Project | null;
}

export function StoriesModule({ selectedProject }: StoriesModuleProps) {
  const [activeTab, setActiveTab] = useState("create");
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedFramework, setSelectedFramework] = useState<string>("");
  const [selectedObjective, setSelectedObjective] = useState<string>("");
  const [selectedCode, setSelectedCode] = useState<string>("");
  const [storyTitle, setStoryTitle] = useState("");
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSlides, setGeneratedSlides] = useState<StorySlide[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch existing stories
  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['/api/stories', selectedProject?.id],
    enabled: !!selectedProject?.id
  });

  // Generate story mutation
  const generateStoryMutation = useMutation({
    mutationFn: async (data: {
      projectId: number;
      title: string;
      framework: string;
      objective: string;
      magneticCode: string;
    }) => {
      return await apiRequest('/api/stories/generate', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: (data) => {
      setGeneratedSlides(data.slides);
      setWizardStep(4); // Go to preview step
      queryClient.invalidateQueries({ queryKey: ['/api/stories'] });
      toast({
        title: "Story criado com sucesso!",
        description: "Revise o conteúdo e faça ajustes se necessário."
      });
    },
    onError: () => {
      toast({
        title: "Erro ao gerar story",
        description: "Tente novamente em alguns instantes.",
        variant: "destructive"
      });
    }
  });

  const handleGenerateStory = () => {
    if (!selectedProject || !storyTitle || !selectedFramework || !selectedObjective || !selectedCode) {
      toast({
        title: "Dados incompletos",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    generateStoryMutation.mutate({
      projectId: selectedProject.id,
      title: storyTitle,
      framework: selectedFramework,
      objective: selectedObjective,
      magneticCode: selectedCode
    });
    setIsGenerating(false);
  };

  const handleObjectiveSelect = (objective: string) => {
    setSelectedObjective(objective);
    // Auto-suggest best framework and code
    const bestCode = Object.keys(MAGNETIC_CODES)[0]; // Simplified for now
    const bestFramework = selectBestFramework(objective, bestCode);
    setSelectedCode(bestCode);
    setSelectedFramework(bestFramework);
    setWizardStep(2);
  };

  const nextSlide = () => {
    if (currentSlide < generatedSlides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const StoryPreview = () => {
    if (!generatedSlides.length) return null;

    const slide = generatedSlides[currentSlide];
    const progress = ((currentSlide + 1) / generatedSlides.length) * 100;

    return (
      <div className="max-w-md mx-auto">
        <div className="relative bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl overflow-hidden aspect-[9/16] shadow-2xl">
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
            {generatedSlides.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-1 bg-white bg-opacity-30 rounded-full overflow-hidden"
              >
                <div
                  className={`h-full bg-white transition-all duration-300 ${
                    index <= currentSlide ? 'w-full' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Slide content */}
          <div className="absolute inset-0 flex flex-col justify-center p-8 text-center text-white">
            {slide.content.headline && (
              <h2 className="text-2xl font-bold mb-4 leading-tight">
                {slide.content.headline}
              </h2>
            )}
            {slide.content.body && (
              <p className="text-lg leading-relaxed opacity-90">
                {slide.content.body}
              </p>
            )}
          </div>

          {/* Navigation controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-none"
            >
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-none"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={nextSlide}
              disabled={currentSlide === generatedSlides.length - 1}
              className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-none"
            >
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="mt-4 text-center">
          <Progress value={progress} className="w-full mb-2" />
          <p className="text-sm text-gray-600">
            Slide {currentSlide + 1} de {generatedSlides.length}
          </p>
        </div>
      </div>
    );
  };

  const WizardStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Qual é o objetivo do seu story?</h3>
        <p className="text-gray-600">Escolha a estratégia baseada nos 4Cs do BRIO</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(OBJECTIVES).map(([key, objective]) => (
          <Card
            key={key}
            className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-purple-300"
            onClick={() => handleObjectiveSelect(key)}
          >
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-3">{objective.icon}</div>
              <h4 className="font-bold text-lg mb-2" style={{ color: objective.color }}>
                {objective.name}
              </h4>
              <p className="text-sm text-gray-600 mb-3">{objective.description}</p>
              <Badge variant="outline" className="text-xs">
                {objective.strategy}
              </Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const WizardStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Escolha o framework</h3>
        <p className="text-gray-600">Estrutura que melhor se adapta ao seu objetivo</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {Object.values(STORY_FRAMEWORKS).map((framework) => (
          <Card
            key={framework.id}
            className={`cursor-pointer transition-all duration-200 border-2 ${
              selectedFramework === framework.id 
                ? 'border-purple-500 bg-purple-50' 
                : 'hover:border-purple-300'
            }`}
            onClick={() => setSelectedFramework(framework.id)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-bold text-lg">{framework.name}</h4>
                <Badge variant="outline">{framework.slideCount} slides</Badge>
              </div>
              <p className="text-sm text-gray-600 mb-4">{framework.description}</p>
              
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Estrutura:</p>
                {framework.structure.map((step, index) => (
                  <div key={index} className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <span className="text-gray-600">{step}</span>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex flex-wrap gap-1">
                {framework.bestFor.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setWizardStep(1)}>
          Voltar
        </Button>
        <Button 
          onClick={() => setWizardStep(3)}
          disabled={!selectedFramework}
        >
          Continuar
        </Button>
      </div>
    </div>
  );

  const WizardStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Configurações finais</h3>
        <p className="text-gray-600">Ajuste os detalhes do seu story</p>
      </div>

      <div className="max-w-lg mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">Título do Story</label>
          <Input
            value={storyTitle}
            onChange={(e) => setStoryTitle(e.target.value)}
            placeholder="Ex: Mitos sobre alimentação saudável"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Código Magnético</label>
          <Select value={selectedCode} onValueChange={setSelectedCode}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um código" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MAGNETIC_CODES).map(([key, code]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <span>{code.icon}</span>
                    <span>{code.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Resumo da Configuração</h4>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Objetivo:</span>
                <span className="font-medium">{OBJECTIVES[selectedObjective]?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Framework:</span>
                <span className="font-medium">{STORY_FRAMEWORKS[selectedFramework]?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Slides:</span>
                <span className="font-medium">{STORY_FRAMEWORKS[selectedFramework]?.slideCount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Código:</span>
                <span className="font-medium">{MAGNETIC_CODES[selectedCode]?.name}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setWizardStep(2)}>
          Voltar
        </Button>
        <Button 
          onClick={handleGenerateStory}
          disabled={!storyTitle || !selectedCode || isGenerating}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
        >
          {isGenerating ? (
            <>
              <Wand2 className="w-4 h-4 mr-2 animate-spin" />
              Gerando...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Gerar Story
            </>
          )}
        </Button>
      </div>
    </div>
  );

  const WizardStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold mb-2">Story criado com sucesso!</h3>
        <p className="text-gray-600">Revise o conteúdo e faça downloads</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Preview */}
        <div>
          <h4 className="font-medium mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Visualização
          </h4>
          <StoryPreview />
        </div>

        {/* Content editor */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Editar Conteúdo
          </h4>
          
          {generatedSlides.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Slide {currentSlide + 1}: {generatedSlides[currentSlide]?.content.headline}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Título</label>
                  <Input
                    value={generatedSlides[currentSlide]?.content.headline || ''}
                    onChange={(e) => {
                      const newSlides = [...generatedSlides];
                      newSlides[currentSlide] = {
                        ...newSlides[currentSlide],
                        content: {
                          ...newSlides[currentSlide].content,
                          headline: e.target.value
                        }
                      };
                      setGeneratedSlides(newSlides);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Conteúdo</label>
                  <Textarea
                    value={generatedSlides[currentSlide]?.content.body || ''}
                    onChange={(e) => {
                      const newSlides = [...generatedSlides];
                      newSlides[currentSlide] = {
                        ...newSlides[currentSlide],
                        content: {
                          ...newSlides[currentSlide].content,
                          body: e.target.value
                        }
                      };
                      setGeneratedSlides(newSlides);
                    }}
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setWizardStep(1)}>
          Criar Novo
        </Button>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Baixar Textos
          </Button>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600">
            Salvar Story
          </Button>
        </div>
      </div>
    </div>
  );

  if (!selectedProject) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Selecione um projeto
          </h3>
          <p className="text-gray-600">
            Escolha um projeto MPMP para começar a criar stories magnéticos
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            Stories Magnéticos
          </h2>
          <p className="text-gray-600 mt-1">
            Crie stories envolventes usando o Método Único de Stories (MUS)
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Criar Story
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Biblioteca
          </TabsTrigger>
          <TabsTrigger value="sequences" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Sequências
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardContent className="p-6">
              {wizardStep === 1 && <WizardStep1 />}
              {wizardStep === 2 && <WizardStep2 />}
              {wizardStep === 3 && <WizardStep3 />}
              {wizardStep === 4 && <WizardStep4 />}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Stories Criados</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                  <p className="text-gray-600 mt-2">Carregando stories...</p>
                </div>
              ) : stories.length === 0 ? (
                <div className="text-center py-8">
                  <Zap className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum story criado ainda
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Comece criando seu primeiro story magnético
                  </p>
                  <Button onClick={() => setActiveTab("create")}>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Criar Primeiro Story
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stories.map((story: StoryProject) => (
                    <Card key={story.id} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-4">
                        <h4 className="font-medium mb-2">{story.title}</h4>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline">{story.framework}</Badge>
                          <Badge variant="secondary">{story.objective}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-3">
                          {story.slides.length} slides
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="w-3 h-3 mr-1" />
                            Ver
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="w-3 h-3 mr-1" />
                            Baixar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sequences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sequências Estratégicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.values(STORY_SEQUENCES).map((sequence) => (
                  <Card key={sequence.id} className="border-2 hover:border-purple-300 transition-colors">
                    <CardContent className="p-6">
                      <h4 className="font-bold text-lg mb-2">{sequence.name}</h4>
                      <p className="text-gray-600 mb-4">{sequence.description}</p>
                      <div className="space-y-2">
                        {sequence.stories.slice(0, 3).map((story, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="font-medium">{story.day}</span>
                            <div className="flex gap-1">
                              <Badge variant="outline" className="text-xs">{story.framework}</Badge>
                              <Badge variant="secondary" className="text-xs">{story.objective}</Badge>
                            </div>
                          </div>
                        ))}
                        {sequence.stories.length > 3 && (
                          <p className="text-xs text-gray-500">
                            +{sequence.stories.length - 3} mais...
                          </p>
                        )}
                      </div>
                      <Button className="w-full mt-4" variant="outline">
                        Usar Sequência
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics de Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Analytics em Desenvolvimento
                </h3>
                <p className="text-gray-600">
                  Métricas detalhadas de performance dos stories estarão disponíveis em breve
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}