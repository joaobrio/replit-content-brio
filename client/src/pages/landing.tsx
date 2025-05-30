import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Target, TrendingUp, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            BRIO<span className="text-purple-600">.IA</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Transforme sua marca pessoal com conteúdo magnético baseado em neurociência aplicada ao Instagram
          </p>
          <Button 
            size="lg" 
            className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-lg"
            onClick={() => window.location.href = "/api/login"}
          >
            Começar Agora
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="text-center">
            <CardHeader>
              <Zap className="w-12 h-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>8 Códigos Magnéticos</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Fórmulas baseadas em neurociência para criar conteúdo que captura atenção
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Estratégia BRIO</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Metodologia completa: Essência, Execução e Expressão da sua marca
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <CardTitle>IA Especializada</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Geração automática de conteúdo otimizado para cada objetivo estratégico
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="w-12 h-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Análise de Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Métricas avançadas e insights para otimizar seu engajamento
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Method Overview */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
            O Método BRIO
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-purple-600">C</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Captar</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Atrair atenção com hooks irresistíveis e conteúdo magnético
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-blue-600">C</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Conectar</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Criar identificação e relacionamento com sua audiência
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-green-600">C</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Convencer</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Demonstrar autoridade e construir confiança através de conteúdo educativo
              </p>
            </div>

            <div className="space-y-4">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl font-bold text-orange-600">C</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Converter</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Transformar engajamento em resultados de negócio
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Pronto para transformar sua marca pessoal?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Entre no BRIO.IA e comece a criar conteúdo magnético hoje mesmo
            </p>
            <Button 
              size="lg" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => window.location.href = "/api/login"}
            >
              Fazer Login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}