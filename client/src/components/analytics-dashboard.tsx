import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, Users, Heart, MessageCircle, Share, Eye, 
  Award, Target, Zap, Instagram, RefreshCw, Calendar,
  ArrowUp, ArrowDown, Minus, Crown, Star
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { type Project } from '@shared/schema';

interface AnalyticsDashboardProps {
  selectedProject: Project | null;
}

interface InstagramMetrics {
  followers: number;
  engagement_rate: number;
  brio_score: number;
  growth_potential: number;
  last_updated: string;
}

interface PostPerformance {
  id: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  reach: number;
  engagement_rate: number;
  magnetic_code: string;
  objective: string;
  post_date: string;
  performance_score: number;
}

interface CodePerformance {
  code: string;
  avg_engagement: number;
  posts_count: number;
  total_reach: number;
  best_performance: number;
  trend: 'up' | 'down' | 'stable';
}

export function AnalyticsDashboard({ selectedProject }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<InstagramMetrics | null>(null);
  const [posts, setPosts] = useState<PostPerformance[]>([]);
  const [codePerformance, setCodePerformance] = useState<CodePerformance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const connectInstagram = async () => {
    toast({
      title: "Conectar Instagram",
      description: "Para conectar sua conta do Instagram, você precisa fornecer um token de acesso. Isso permitirá que analisemos a performance dos seus posts.",
    });
    
    // TODO: Implement Instagram connection flow
    // This would involve OAuth flow and requesting Instagram Business API access
  };

  const refreshData = async () => {
    if (!selectedProject || !isConnected) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/analytics/instagram/${selectedProject.id}`);
      if (response.ok) {
        const data = await response.json();
        setMetrics(data.metrics);
        setPosts(data.posts);
        setCodePerformance(data.codePerformance);
      }
    } catch (error) {
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados do Instagram.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444'];

  // Demo data based on the dashboard image
  const mockMetrics: InstagramMetrics = {
    followers: 534100,
    engagement_rate: 1.8,
    brio_score: 80,
    growth_potential: 25,
    last_updated: new Date().toISOString()
  };

  const demoPostsData: PostPerformance[] = [
    {
      id: '1',
      caption: 'Obesidade (Amyrcretin): A revolução no tratamento da obesidade que você precisa conhecer...',
      likes: 5200,
      comments: 342,
      shares: 128,
      reach: 45000,
      engagement_rate: 12.3,
      magnetic_code: 'Confirmação de Suspeitas',
      objective: 'convencer',
      post_date: '2025-01-15',
      performance_score: 92
    },
    {
      id: '2',
      caption: 'Viva la Vida: Como transformei minha abordagem médica depois de quase desistir...',
      likes: 1200,
      comments: 89,
      shares: 34,
      reach: 12000,
      engagement_rate: 11.1,
      magnetic_code: 'História Pessoal',
      objective: 'conectar',
      post_date: '2025-01-14',
      performance_score: 78
    },
    {
      id: '3',
      caption: 'Coragem: Por que a maioria dos médicos não fala sobre isso com seus pacientes...',
      likes: 890,
      comments: 56,
      shares: 23,
      reach: 8500,
      engagement_rate: 11.4,
      magnetic_code: 'Elefante na Sala',
      objective: 'captar',
      post_date: '2025-01-13',
      performance_score: 71
    },
    {
      id: '4',
      caption: 'GAFLIX 300 vídeos: Acesso completo ao maior acervo de gastroenterologia do Brasil...',
      likes: 320,
      comments: 28,
      shares: 12,
      reach: 3500,
      engagement_rate: 10.3,
      magnetic_code: 'Solução Única',
      objective: 'converter',
      post_date: '2025-01-12',
      performance_score: 68
    },
    {
      id: '5',
      caption: 'Devagar e Sempre: A estratégia que mudou completamente meus resultados com pacientes...',
      likes: 280,
      comments: 19,
      shares: 8,
      reach: 2800,
      engagement_rate: 10.9,
      magnetic_code: 'Vitória Transformadora',
      objective: 'conectar',
      post_date: '2025-01-11',
      performance_score: 65
    }
  ];

  const mockCodePerformance: CodePerformance[] = [
    { code: 'Confirmação de Suspeitas', avg_engagement: 12.3, posts_count: 8, total_reach: 120000, best_performance: 92, trend: 'up' },
    { code: 'História Pessoal', avg_engagement: 10.8, posts_count: 6, total_reach: 95000, best_performance: 85, trend: 'up' },
    { code: 'Ruptura Cognitiva', avg_engagement: 9.2, posts_count: 5, total_reach: 78000, best_performance: 79, trend: 'stable' },
    { code: 'Solução Única', avg_engagement: 8.7, posts_count: 4, total_reach: 62000, best_performance: 76, trend: 'down' },
    { code: 'Vitória Transformadora', avg_engagement: 8.1, posts_count: 3, total_reach: 45000, best_performance: 72, trend: 'stable' }
  ];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-500" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-500" />;
      default: return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getObjectiveColor = (objective: string) => {
    switch (objective) {
      case 'captar': return 'bg-blue-100 text-blue-800';
      case 'conectar': return 'bg-green-100 text-green-800';
      case 'convencer': return 'bg-purple-100 text-purple-800';
      case 'converter': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-bold text-gray-900">
            <BarChart className="w-6 h-6 text-purple-500" />
            Dashboard BRIO Analytics
          </CardTitle>
          <p className="text-gray-600">
            Análise estratégica da performance dos seus conteúdos no Instagram
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {!selectedProject ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800 text-sm">
                ⚠️ Selecione um projeto MPMP para visualizar os analytics do Instagram
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-800 mb-2">📊 Dashboard Demonstrativo</h4>
                <p className="text-blue-700 text-sm mb-3">
                  Visualização demonstrativa baseada nos dados do dashboard BRIO Analytics da @drgabrielaleimeida. 
                  Para dados reais, conecte sua conta do Instagram Business.
                </p>
                
                <div className="flex gap-2">
                  <Button
                    onClick={connectInstagram}
                    variant="outline"
                    className="border-blue-300 text-blue-700 hover:bg-blue-50 flex items-center gap-2"
                  >
                    <Instagram className="w-4 h-4" />
                    Conectar Instagram Real
                  </Button>
                  <Badge className="bg-blue-100 text-blue-800">
                    Modo Demonstração
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-700">
                    <span className="font-medium">Projeto Ativo:</span> {selectedProject.name}
                  </p>
                </div>
                
                <div className="text-xs text-gray-500">
                  Última atualização: {new Date(mockMetrics.last_updated).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          )}


        </CardContent>
      </Card>

      {/* Demo Mode - Show mock data for demonstration */}
      {selectedProject && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-500 rounded-lg">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Seguidores</p>
                    <p className="text-2xl font-bold text-blue-900">
                      {mockMetrics.followers.toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-500 rounded-lg">
                    <Heart className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 font-medium">Taxa Engajamento</p>
                    <p className="text-2xl font-bold text-green-900">
                      {mockMetrics.engagement_rate}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-500 rounded-lg">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 font-medium">Score BRIO</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {mockMetrics.brio_score}/100
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-500 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 font-medium">Potencial Crescimento</p>
                    <p className="text-2xl font-bold text-orange-900">
                      +{mockMetrics.growth_potential}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="posts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="posts">Posts Recentes</TabsTrigger>
              <TabsTrigger value="codes">Códigos Magnéticos</TabsTrigger>
              <TabsTrigger value="insights">Insights BRIO</TabsTrigger>
            </TabsList>

            {/* Posts Performance */}
            <TabsContent value="posts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-purple-500" />
                    Performance dos 5 Posts Mais Recentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {demoPostsData.map((post, index) => (
                      <div key={post.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <p className="text-sm text-gray-700 line-clamp-2 mb-2">
                              {post.caption}
                            </p>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getObjectiveColor(post.objective)}>
                                {post.objective.toUpperCase()}
                              </Badge>
                              <Badge variant="outline">
                                {post.magnetic_code}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 mb-1">
                              {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                              <span className="text-lg font-bold text-purple-600">
                                {post.performance_score}
                              </span>
                              <span className="text-xs text-gray-500">/100</span>
                            </div>
                            <p className="text-xs text-gray-500">
                              {new Date(post.post_date).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-500">Curtidas</p>
                            <p className="font-medium">{post.likes.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Comentários</p>
                            <p className="font-medium">{post.comments}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Alcance</p>
                            <p className="font-medium">{post.reach.toLocaleString()}</p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Engajamento</p>
                            <p className="font-medium text-purple-600">{post.engagement_rate}%</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Codes Performance */}
            <TabsContent value="codes" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-500" />
                    Performance dos Códigos Magnéticos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockCodePerformance.map((code, index) => (
                      <div key={code.code} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {index === 0 && <Star className="w-5 h-5 text-yellow-500" />}
                            <h4 className="font-medium text-gray-900">{code.code}</h4>
                            {getTrendIcon(code.trend)}
                          </div>
                          <Badge variant={index < 2 ? 'default' : 'secondary'}>
                            #{index + 1} melhor
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Engajamento Médio</p>
                            <p className="font-medium text-purple-600">{code.avg_engagement}%</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Posts</p>
                            <p className="font-medium">{code.posts_count}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Alcance Total</p>
                            <p className="font-medium">{code.total_reach.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Melhor Score</p>
                            <p className="font-medium">{code.best_performance}/100</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* BRIO Insights */}
            <TabsContent value="insights" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-purple-500" />
                      Recomendações BRIO
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">✅ Continue Usando</h4>
                      <p className="text-sm text-green-700">
                        <strong>Confirmação de Suspeitas</strong> está performando excepcionalmente bem (+12.3% engajamento). 
                        Priorize este código nos próximos calendários.
                      </p>
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <h4 className="font-medium text-yellow-800 mb-2">⚡ Otimize</h4>
                      <p className="text-sm text-yellow-700">
                        <strong>Solução Única</strong> tem potencial mas está abaixo da média. 
                        Teste variações na abordagem ou timing de publicação.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">🔍 Explore</h4>
                      <p className="text-sm text-blue-700">
                        Considere usar mais <strong>Elefante na Sala</strong> - você ainda não testou 
                        suficientemente este código de alto potencial.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      Próximo Calendário
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg">
                      <div className="text-3xl font-bold text-purple-600 mb-2">92%</div>
                      <p className="text-sm text-purple-700 mb-4">
                        Otimização sugerida para próximo mês baseada nos dados
                      </p>
                      <Button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                        Gerar Calendário Otimizado
                      </Button>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Confirmação de Suspeitas</span>
                        <span className="font-medium">40% (+15%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>História Pessoal</span>
                        <span className="font-medium">30% (+5%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Elefante na Sala</span>
                        <span className="font-medium">20% (+20%)</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Outros códigos</span>
                        <span className="font-medium">10% (-40%)</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}