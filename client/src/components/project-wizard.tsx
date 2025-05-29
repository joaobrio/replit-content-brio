import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Plus, ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Project, type InsertProject } from '@shared/schema';

interface ProjectWizardProps {
  project?: Project;
  onSave: (project: InsertProject) => void;
  onCancel: () => void;
}

export function ProjectWizard({ project, onSave, onCancel }: ProjectWizardProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('essencia');
  
  // Form state
  const [formData, setFormData] = useState<Partial<InsertProject>>({
    name: project?.name || '',
    // Essência
    purpose: project?.purpose || '',
    values: project?.values as string[] || [],
    originStory: project?.originStory || '',
    mission: project?.mission || '',
    archetype: project?.archetype || undefined,
    superpowers: project?.superpowers as string[] || [],
    vulnerabilities: project?.vulnerabilities as string[] || [],
    // Execução
    mainSpecialty: project?.mainSpecialty || '',
    subspecialties: project?.subspecialties as string[] || [],
    differentials: project?.differentials as string[] || [],
    methodology: project?.methodology || '',
    typicalResults: project?.typicalResults as string[] || [],
    guarantees: project?.guarantees as string[] || [],
    // Expressão
    keywords: project?.keywords as string[] || [],
    avoidWords: project?.avoidWords as string[] || [],
    brandColors: project?.brandColors as string[] || [],
    visualStyle: project?.visualStyle || undefined,
    mainHashtags: project?.mainHashtags as string[] || [],
    postSignature: project?.postSignature || '',
    defaultBio: project?.defaultBio || '',
  });

  const [newItem, setNewItem] = useState('');

  const handleInputChange = (field: keyof InsertProject, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addArrayItem = (field: keyof InsertProject, item: string) => {
    if (!item.trim()) return;
    
    const currentArray = (formData[field] as string[]) || [];
    handleInputChange(field, [...currentArray, item.trim()]);
    setNewItem('');
  };

  const removeArrayItem = (field: keyof InsertProject, index: number) => {
    const currentArray = (formData[field] as string[]) || [];
    const newArray = currentArray.filter((_, i) => i !== index);
    handleInputChange(field, newArray);
  };

  const handleSave = () => {
    if (!formData.name?.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, forneça um nome para o projeto.",
        variant: "destructive",
      });
      return;
    }

    onSave(formData as InsertProject);
  };

  const ArrayInput = ({ 
    field, 
    label, 
    placeholder 
  }: { 
    field: keyof InsertProject; 
    label: string; 
    placeholder: string; 
  }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      <div className="flex gap-2">
        <Input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          placeholder={placeholder}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addArrayItem(field, newItem);
            }
          }}
        />
        <Button
          type="button"
          onClick={() => addArrayItem(field, newItem)}
          size="sm"
          variant="outline"
        >
          <Plus className="w-4 h-4" />
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {((formData[field] as string[]) || []).map((item, index) => (
          <Badge key={index} variant="secondary" className="flex items-center gap-1">
            {item}
            <X
              className="w-3 h-3 cursor-pointer hover:text-red-500"
              onClick={() => removeArrayItem(field, index)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <Card className="bg-white rounded-2xl shadow-sm border border-gray-200 max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">
          {project ? 'Editar MPMP' : 'Criar Novo MPMP'}
        </CardTitle>
        <p className="text-gray-600">
          Manual de Posicionamento de Marca Pessoal - Configure sua identidade profissional
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Project Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">Nome do Projeto *</label>
          <Input
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Ex: Dr. João - Cardiologia Preventiva"
            className="w-full"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="essencia">Essência</TabsTrigger>
            <TabsTrigger value="execucao">Execução</TabsTrigger>
            <TabsTrigger value="expressao">Expressão</TabsTrigger>
          </TabsList>

          {/* ESSÊNCIA */}
          <TabsContent value="essencia" className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-blue-900 mb-2">🎯 ESSÊNCIA - Quem Você Realmente É</h3>
              <p className="text-sm text-blue-700">
                Esta seção explora sua identidade profissional mais profunda: propósito, valores e singularidade.
              </p>
            </div>

            {/* 1. Propósito Profissional */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                1. Qual é seu propósito como profissional? *
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Reflita sobre o impacto que você deseja ter em seus clientes/público e em sua área de atuação. 
                Qual diferença única você quer fazer no mundo além do aspecto financeiro?
              </p>
              <Textarea
                value={formData.purpose || ''}
                onChange={(e) => handleInputChange('purpose', e.target.value)}
                placeholder='Ex: "Meu propósito profissional mais profundo é democratizar o acesso à educação financeira de qualidade. Acredito que a liberdade financeira é um direito de todos..."'
                rows={4}
                className="text-sm"
              />
            </div>

            {/* 2. Valores Fundamentais */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                2. Quais são seus 3-5 valores fundamentais e inegociáveis? *
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Quais princípios guiam suas decisões e abordagens mesmo quando difíceis ou custosos?
              </p>
              <ArrayInput
                field="values"
                label=""
                placeholder='Ex: "Integridade: Recomendo apenas o que eu mesmo faria ou indicaria para minha família..."'
              />
            </div>

            {/* 3. Motivação Original */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                3. O que te motivou a seguir sua profissão e especialidade atual?
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Você teve um momento de virada ou insight transformador na sua trajetória profissional? 
                Conte sobre sua jornada e as escolhas que te trouxeram até aqui.
              </p>
              <Textarea
                value={formData.originStory || ''}
                onChange={(e) => handleInputChange('originStory', e.target.value)}
                placeholder='Ex: "Desde a adolescência tenho o hábito de... Em 2018, conheci uma pessoa que mudou a minha perspectiva sobre..."'
                rows={4}
                className="text-sm"
              />
            </div>

            {/* 4. História Pessoal Formativa */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                4. O que na sua história pessoal moldou sua visão única sobre sua área de atuação?
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Experiências formativas, desafios superados ou influências significativas que moldaram quem você é hoje profissionalmente.
              </p>
              <Textarea
                value={formData.mission || ''}
                onChange={(e) => handleInputChange('mission', e.target.value)}
                placeholder='Ex: "Cresci em uma família de classe média que enfrentou sérias dificuldades financeiras quando eu tinha 12 anos..."'
                rows={4}
                className="text-sm"
              />
            </div>

            {/* 5. Arquétipos */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                5. Selecione dois arquétipos que melhor representam a essência do seu trabalho *
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Os arquétipos são padrões universais de personalidade baseados nos estudos de Carl Jung. 
                Eles ajudam a definir a personalidade da sua marca, criando conexão emocional consistente com seu público.
              </p>
              <Select
                value={formData.archetype || ''}
                onValueChange={(value) => handleInputChange('archetype', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu arquétipo principal..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inocente">Inocente - Otimista, honesto, puro, busca a felicidade</SelectItem>
                  <SelectItem value="sabio">Sábio - Analítico, especialista, mentor, valoriza conhecimento</SelectItem>
                  <SelectItem value="explorador">Explorador - Independente, pioneiro, busca descobrir o novo</SelectItem>
                  <SelectItem value="heroi">Herói - Corajoso, protetor, enfrenta desafios e supera obstáculos</SelectItem>
                  <SelectItem value="fora-da-lei">Fora-da-Lei - Revolucionário, disruptivo, questiona regras</SelectItem>
                  <SelectItem value="mago">Mago - Transformador, visionário, catalisador de mudanças</SelectItem>
                  <SelectItem value="cara-comum">Cara Comum - Acessível, empático, realista, pragmático</SelectItem>
                  <SelectItem value="amante">Amante - Apaixonado, comprometido com relacionamentos profundos</SelectItem>
                  <SelectItem value="bobo">Bobo da Corte - Divertido, irreverente, espontâneo, alegre</SelectItem>
                  <SelectItem value="cuidador">Cuidador - Altruísta, compassivo, nutridor, protetor</SelectItem>
                  <SelectItem value="criador">Criador - Inovador, artístico, inventivo, perfeccionista</SelectItem>
                  <SelectItem value="governante">Governante - Líder, organizador, responsável, controlador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 6. Crenças Contrárias */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                6. Liste 5 (ou mais) crenças ou práticas comuns na sua área com as quais você discorda fundamentalmente
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Ex: "Discordo que [prática/crença comum], porque [sua perspectiva]"
              </p>
              <ArrayInput
                field="vulnerabilities"
                label=""
                placeholder='Ex: "Discordo que pacientes devam aceitar passivamente diagnósticos sem buscar segunda opinião..."'
              />
            </div>

            {/* 7. Superpoderes/Qualificações */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                7. Qual sua qualificação específica/expertise para oferecer uma alternativa superior?
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Formações, experiências, especializações, pesquisas, publicações que te qualificam de forma única.
              </p>
              <ArrayInput
                field="superpowers"
                label=""
                placeholder='Ex: "Especialização em Terapia Cognitivo-Comportamental e Neurociência, participação em duas pesquisas acadêmicas..."'
              />
            </div>
          </TabsContent>

          {/* EXECUÇÃO */}
          <TabsContent value="execucao" className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-green-900 mb-2">⚡ EXECUÇÃO - O Que Você Genuinamente Entrega</h3>
              <p className="text-sm text-green-700">
                Esta seção explora sua metodologia, experiência e os resultados concretos que você oferece.
              </p>
            </div>

            {/* 8. Golden Circle */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-800">
                8. Golden Circle - Defina seu posicionamento estratégico:
              </label>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    POR QUÊ: Qual propósito fundamental move suas ações profissionais?
                  </label>
                  <Textarea
                    value={formData.mission || ''}
                    onChange={(e) => handleInputChange('mission', e.target.value)}
                    placeholder='Ex: "Acredito que a saúde não pode ser alcançada sem conhecimento. Minha missão é..."'
                    rows={2}
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    COMO: Qual abordagem/método único diferencia sua prática?
                  </label>
                  <Input
                    value={formData.methodology}
                    onChange={(e) => handleInputChange('methodology', e.target.value)}
                    placeholder='Ex: "Desenvolvi o Método Core, uma abordagem em três fases..."'
                    className="text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">
                    O QUÊ: Quais serviços/produtos específicos você oferece?
                  </label>
                  <Input
                    value={formData.mainSpecialty}
                    onChange={(e) => handleInputChange('mainSpecialty', e.target.value)}
                    placeholder='Ex: "Programa de acompanhamento com 3 consultas // Curso online com aulas semanais..."'
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* 9. Análise de Valor */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                9. Análise de Valor:
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Quais serviços/produtos geram maior retorno financeiro? Quais geram maior impacto positivo para seus clientes?
              </p>
              <ArrayInput
                field="typicalResults"
                label=""
                placeholder='Ex: "Consulta individual: maior impacto transformacional, Curso online: maior alcance e retorno financeiro..."'
              />
            </div>

            {/* 10. Resultados e Transformações */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                10. Quais transformações seus clientes experimentam após trabalharem com você?
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Seja específico sobre resultados mensuráveis, mudanças comportamentais, melhorias de qualidade de vida, etc.
              </p>
              <ArrayInput
                field="guarantees"
                label=""
                placeholder='Ex: "Redução de 70% nos níveis de ansiedade em 8 semanas, Aumento de 40% na produtividade profissional..."'
              />
            </div>

            {/* 11. Diferenciais Competitivos */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                11. O que diferencia fundamentalmente sua abordagem dos concorrentes?
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Metodologias próprias, tecnologias exclusivas, formações especiais, experiências únicas, etc.
              </p>
              <ArrayInput
                field="differentials"
                label=""
                placeholder='Ex: "Única profissional da região com certificação em X, Método próprio validado cientificamente..."'
              />
            </div>

            {/* 12. Especializações */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                12. Quais são suas especializações e sub-especializações?
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Áreas específicas de expertise, nichos de mercado, públicos especializados que você atende.
              </p>
              <ArrayInput
                field="subspecialties"
                label=""
                placeholder='Ex: "Cardiologia Preventiva, Reabilitação Cardiovascular, Medicina do Esporte..."'
              />
            </div>
          </TabsContent>

          {/* EXPRESSÃO */}
          <TabsContent value="expressao" className="space-y-6">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
              <h3 className="font-medium text-purple-900 mb-2">🎨 EXPRESSÃO - Como Você Autenticamente Comunica</h3>
              <p className="text-sm text-purple-700">
                Esta seção define sua identidade visual, linguagem e como você será reconhecido pelo seu público.
              </p>
            </div>

            {/* 13. Tom de Voz e Personalidade */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-800">
                13. Como você descreveria seu tom de voz ideal na comunicação?
              </label>
              <p className="text-xs text-gray-600 mb-3">
                Defina a personalidade da sua comunicação: formal/informal, técnico/acessível, direto/sutil, etc.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Formalidade</label>
                  <Select
                    value={formData.toneOfVoice?.formalidade || ''}
                    onValueChange={(value) => handleInputChange('toneOfVoice', {...(formData.toneOfVoice as any || {}), formalidade: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="equilibrado">Equilibrado</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Energia</label>
                  <Select
                    value={formData.toneOfVoice?.energia || ''}
                    onValueChange={(value) => handleInputChange('toneOfVoice', {...(formData.toneOfVoice as any || {}), energia: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="calma">Calma</SelectItem>
                      <SelectItem value="moderada">Moderada</SelectItem>
                      <SelectItem value="energetica">Energética</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-700">Proximidade</label>
                  <Select
                    value={formData.toneOfVoice?.proximidade || ''}
                    onValueChange={(value) => handleInputChange('toneOfVoice', {...(formData.toneOfVoice as any || {}), proximidade: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="distante">Distante</SelectItem>
                      <SelectItem value="profissional">Profissional</SelectItem>
                      <SelectItem value="amigavel">Amigável</SelectItem>
                      <SelectItem value="intimo">Íntimo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* 14. Palavras-chave e Linguagem */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                14. Quais palavras/termos/conceitos você quer que sejam associados à sua marca?
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Termos técnicos, valores, benefícios, emoções que você quer evocar na mente do seu público.
              </p>
              <ArrayInput
                field="keywords"
                label=""
                placeholder='Ex: "Transformação, Evidência científica, Cuidado humanizado, Excelência técnica..."'
              />
            </div>

            {/* 15. Palavras a Evitar */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                15. Existem palavras/termos que você evita usar na sua comunicação?
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Termos negativos, jargões confusos, palavras que podem gerar mal-entendidos ou desconforto.
              </p>
              <ArrayInput
                field="avoidWords"
                label=""
                placeholder='Ex: "Problema, Doença terminal, Impossível, Garantia 100%..."'
              />
            </div>

            {/* 16. Estilo Visual */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                16. Como você enxerga o estilo visual da sua marca?
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Estética geral, cores predominantes, sensações que as imagens devem transmitir.
              </p>
              <Select
                value={formData.visualStyle || ''}
                onValueChange={(value) => handleInputChange('visualStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estilo visual..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimalista">Minimalista - Limpo, simples, elegante</SelectItem>
                  <SelectItem value="colorido">Colorido - Vibrante, dinâmico, energético</SelectItem>
                  <SelectItem value="profissional">Profissional - Sério, confiável, corporativo</SelectItem>
                  <SelectItem value="moderno">Moderno - Inovador, tecnológico, atual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 17. Cores da Marca */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                17. Cores da Marca
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Cores que representam sua personalidade profissional e transmitem as emoções desejadas.
              </p>
              <ArrayInput
                field="brandColors"
                label=""
                placeholder='Ex: "Azul confiança (#2563eb), Verde saúde (#16a34a), Dourado premium (#f59e0b)..."'
              />
            </div>

            {/* 18. Hashtags e Linguagem Digital */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-800">
                18. Hashtags principais e linguagem digital
              </label>
              <p className="text-xs text-gray-600 mb-2">
                Hashtags que você usa consistentemente e que ajudam a encontrar seu conteúdo.
              </p>
              <ArrayInput
                field="mainHashtags"
                label=""
                placeholder='Ex: "#cardiologia, #saudedocoração, #prevencao, #vidasaudavel..."'
              />
            </div>

            {/* 19. Assinatura e Bio */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800">
                  19. Assinatura dos Posts
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Como você se identifica no final dos posts/conteúdos.
                </p>
                <Input
                  value={formData.postSignature || ''}
                  onChange={(e) => handleInputChange('postSignature', e.target.value)}
                  placeholder='Ex: "Dr. João - Seu coração em boas mãos ❤️"'
                  className="text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-800">
                  20. Bio Padrão
                </label>
                <p className="text-xs text-gray-600 mb-2">
                  Descrição concisa para perfis e apresentações.
                </p>
                <Input
                  value={formData.defaultBio || ''}
                  onChange={(e) => handleInputChange('defaultBio', e.target.value)}
                  placeholder='Ex: "Cardiologista | Prevenção cardiovascular | 15 anos transformando vidas"'
                  className="text-sm"
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onCancel}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Cancelar
          </Button>

          <div className="flex gap-2">
            {activeTab === 'essencia' && (
              <Button
                onClick={() => setActiveTab('execucao')}
                className="flex items-center gap-2"
              >
                Próximo: Execução
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
            
            {activeTab === 'execucao' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('essencia')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  onClick={() => setActiveTab('expressao')}
                  className="flex items-center gap-2"
                >
                  Próximo: Expressão
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </>
            )}
            
            {activeTab === 'expressao' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setActiveTab('execucao')}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Anterior
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Salvar MPMP
                </Button>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}