import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, Search, Filter, Star, TrendingUp, 
  Heart, MessageCircle, Share, Eye, User, Instagram 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { type SuccessStory } from '@shared/schema';
import { MAGNETIC_CODES, OBJECTIVES } from '@/lib/magnetic-codes';

interface SuccessStoriesProps {
  className?: string;
}

export function SuccessStories({ className }: SuccessStoriesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedCode, setSelectedCode] = useState<string>('all');
  const [selectedObjective, setSelectedObjective] = useState<string>('all');

  const { data: stories = [], isLoading } = useQuery({
    queryKey: ['/api/success-stories', { search: searchTerm, industry: selectedIndustry, code: selectedCode, objective: selectedObjective }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedIndustry !== 'all') params.append('industry', selectedIndustry);
      if (selectedCode !== 'all') params.append('magneticCode', selectedCode);
      if (selectedObjective !== 'all') params.append('objective', selectedObjective);
      
      const response = await fetch(`/api/success-stories?${params}`);
      if (!response.ok) throw new Error('Failed to fetch stories');
      return response.json();
    }
  });

  const featuredStories = stories.filter((story: SuccessStory) => story.isFeatured);
  const regularStories = stories.filter((story: SuccessStory) => !story.isFeatured);

  const formatMetric = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  const getObjectiveColor = (objective: string) => {
    const colors = {
      captar: 'bg-blue-100 text-blue-800',
      conectar: 'bg-green-100 text-green-800',
      convencer: 'bg-purple-100 text-purple-800',
      converter: 'bg-orange-100 text-orange-800'
    };
    return colors[objective as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getCodeColor = (code: string) => {
    const colors = [
      'bg-red-100 text-red-800',
      'bg-yellow-100 text-yellow-800',
      'bg-green-100 text-green-800',
      'bg-blue-100 text-blue-800',
      'bg-indigo-100 text-indigo-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-gray-100 text-gray-800'
    ];
    const index = Object.keys(MAGNETIC_CODES).indexOf(code);
    return colors[index] || 'bg-gray-100 text-gray-800';
  };

  const StoryCard = ({ story, featured = false }: { story: SuccessStory; featured?: boolean }) => (
    <Card className={`hover:shadow-lg transition-shadow ${featured ? 'border-yellow-200 bg-gradient-to-br from-yellow-50 to-orange-50' : ''}`}>
      {featured && (
        <div className="flex items-center gap-2 px-4 sm:px-6 pt-4 sm:pt-6">
          <Star className="w-4 h-4 text-yellow-500 fill-current" />
          <span className="text-sm font-medium text-yellow-700">Caso em Destaque</span>
        </div>
      )}
      
      <CardHeader className={`${featured ? 'pt-2' : ''} pb-3 sm:pb-4`}>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-base sm:text-lg leading-tight">{story.title}</CardTitle>
            <p className="text-sm text-gray-600 mt-2 line-clamp-2">{story.description}</p>
          </div>
          {featured && <Badge className="bg-yellow-100 text-yellow-800 w-fit">Destaque</Badge>}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Author Info */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-sm sm:text-base">{story.author}</p>
            <p className="text-xs sm:text-sm text-gray-600">{story.authorRole}</p>
            {story.authorInstagram && (
              <div className="flex items-center gap-1 mt-1">
                <Instagram className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-500">@{story.authorInstagram}</span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getObjectiveColor(story.objective)}>
            {OBJECTIVES[story.objective as keyof typeof OBJECTIVES]?.name || story.objective}
          </Badge>
          <Badge className={getCodeColor(story.magneticCode)}>
            {MAGNETIC_CODES[story.magneticCode]?.name || story.magneticCode}
          </Badge>
          <Badge variant="outline" className="text-xs">
            {story.industry}
          </Badge>
        </div>

        {/* Metrics */}
        {story.metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-3 border-t">
            {story.metrics.likes && (
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">{formatMetric(story.metrics.likes)}</span>
              </div>
            )}
            {story.metrics.comments && (
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">{formatMetric(story.metrics.comments)}</span>
              </div>
            )}
            {story.metrics.shares && (
              <div className="flex items-center gap-2">
                <Share className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">{formatMetric(story.metrics.shares)}</span>
              </div>
            )}
            {story.metrics.reach && (
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">{formatMetric(story.metrics.reach)}</span>
              </div>
            )}
          </div>
        )}

        {/* Content Preview */}
        <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
          <p className="text-sm text-gray-700 italic line-clamp-3">"{story.content}"</p>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`space-y-4 sm:space-y-6 ${className}`}>
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl font-bold text-gray-900">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500" />
            <span className="hidden sm:inline">Biblioteca de Casos de Sucesso</span>
            <span className="sm:hidden">Casos de Sucesso</span>
          </CardTitle>
          <p className="text-sm sm:text-base text-gray-600">
            <span className="hidden sm:inline">Exemplos reais de conteúdos que geraram resultados extraordinários usando os Códigos Magnéticos</span>
            <span className="sm:hidden">Exemplos reais de conteúdos magnéticos que funcionaram</span>
          </p>
        </CardHeader>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar casos de sucesso..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:flex gap-2 sm:gap-4">
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Área" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as áreas</SelectItem>
                  <SelectItem value="saude">Saúde</SelectItem>
                  <SelectItem value="educacao">Educação</SelectItem>
                  <SelectItem value="tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="consultoria">Consultoria</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedObjective} onValueChange={setSelectedObjective}>
                <SelectTrigger className="w-full sm:w-[130px]">
                  <SelectValue placeholder="Objetivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {Object.entries(OBJECTIVES).map(([key, obj]) => (
                    <SelectItem key={key} value={key}>{obj.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stories Content */}
      <Tabs defaultValue="featured" className="space-y-4 sm:space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="featured">Em Destaque</TabsTrigger>
          <TabsTrigger value="all">Todos os Casos</TabsTrigger>
        </TabsList>

        <TabsContent value="featured">
          {isLoading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : featuredStories.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum caso em destaque encontrado</h3>
                <p className="text-gray-600">Aguarde enquanto adicionamos novos casos de sucesso à biblioteca.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {featuredStories.map((story) => (
                <StoryCard key={story.id} story={story} featured />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="all">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-16 bg-gray-200 rounded"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stories.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum caso encontrado</h3>
                <p className="text-gray-600">Tente ajustar os filtros ou termos de busca para encontrar casos de sucesso.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}