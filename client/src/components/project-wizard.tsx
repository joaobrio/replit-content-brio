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
          <TabsContent value="essencia" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Propósito</label>
                <Textarea
                  value={formData.purpose}
                  onChange={(e) => handleInputChange('purpose', e.target.value)}
                  placeholder="Por que você faz o que faz?"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Missão</label>
                <Textarea
                  value={formData.mission}
                  onChange={(e) => handleInputChange('mission', e.target.value)}
                  placeholder="O que você quer transformar no mundo?"
                  rows={3}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">História de Origem</label>
              <Textarea
                value={formData.originStory}
                onChange={(e) => handleInputChange('originStory', e.target.value)}
                placeholder="A história que define você como profissional..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Arquétipo</label>
              <Select
                value={formData.archetype || ''}
                onValueChange={(value) => handleInputChange('archetype', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione seu arquétipo..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="heroi">Herói - Enfrenta desafios</SelectItem>
                  <SelectItem value="cuidador">Cuidador - Protege e cuida</SelectItem>
                  <SelectItem value="sabio">Sábio - Compartilha conhecimento</SelectItem>
                  <SelectItem value="explorador">Explorador - Busca inovação</SelectItem>
                  <SelectItem value="criador">Criador - Constrói soluções</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ArrayInput
              field="values"
              label="Valores Core"
              placeholder="Ex: Excelência, Empatia, Inovação..."
            />

            <ArrayInput
              field="superpowers"
              label="Superpoderes"
              placeholder="Ex: Diagnóstico preciso, Comunicação clara..."
            />

            <ArrayInput
              field="vulnerabilities"
              label="Vulnerabilidades"
              placeholder="Ex: Perfeccionismo, Ansiedade por resultados..."
            />
          </TabsContent>

          {/* EXECUÇÃO */}
          <TabsContent value="execucao" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Especialidade Principal</label>
                <Input
                  value={formData.mainSpecialty}
                  onChange={(e) => handleInputChange('mainSpecialty', e.target.value)}
                  placeholder="Ex: Cardiologia"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Metodologia Própria</label>
                <Input
                  value={formData.methodology}
                  onChange={(e) => handleInputChange('methodology', e.target.value)}
                  placeholder="Ex: Método CORAÇÃO Saudável"
                />
              </div>
            </div>

            <ArrayInput
              field="subspecialties"
              label="Subespecialidades"
              placeholder="Ex: Cardiologia Preventiva, Reabilitação..."
            />

            <ArrayInput
              field="differentials"
              label="Diferenciais"
              placeholder="Ex: Atendimento humanizado, Tecnologia de ponta..."
            />

            <ArrayInput
              field="typicalResults"
              label="Resultados Típicos"
              placeholder="Ex: 90% redução de riscos cardiovasculares..."
            />

            <ArrayInput
              field="guarantees"
              label="Garantias"
              placeholder="Ex: Acompanhamento 24h, Satisfação garantida..."
            />
          </TabsContent>

          {/* EXPRESSÃO */}
          <TabsContent value="expressao" className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Estilo Visual</label>
              <Select
                value={formData.visualStyle || ''}
                onValueChange={(value) => handleInputChange('visualStyle', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o estilo visual..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimalista">Minimalista</SelectItem>
                  <SelectItem value="colorido">Colorido</SelectItem>
                  <SelectItem value="profissional">Profissional</SelectItem>
                  <SelectItem value="moderno">Moderno</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Assinatura dos Posts</label>
                <Input
                  value={formData.postSignature}
                  onChange={(e) => handleInputChange('postSignature', e.target.value)}
                  placeholder="Ex: Dr. João - Seu coração em boas mãos ❤️"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bio Padrão</label>
                <Input
                  value={formData.defaultBio}
                  onChange={(e) => handleInputChange('defaultBio', e.target.value)}
                  placeholder="Ex: Cardiologista | Prevenção cardiovascular..."
                />
              </div>
            </div>

            <ArrayInput
              field="keywords"
              label="Palavras-chave"
              placeholder="Ex: saúde cardiovascular, prevenção..."
            />

            <ArrayInput
              field="avoidWords"
              label="Palavras a Evitar"
              placeholder="Ex: doença, problema, risco..."
            />

            <ArrayInput
              field="mainHashtags"
              label="Hashtags Principais"
              placeholder="Ex: #cardiologia, #saude, #prevencao..."
            />

            <ArrayInput
              field="brandColors"
              label="Cores da Marca"
              placeholder="Ex: #2563eb, #dc2626, #16a34a..."
            />
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