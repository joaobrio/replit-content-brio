import { useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock, Sparkles } from 'lucide-react';
import { useBrioStore } from '@/lib/zustand-store';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function HistorySidebar() {
  const { history, loadHistory } = useBrioStore();

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const getCodeColor = (code: string) => {
    const colorMap: Record<string, string> = {
      'História Pessoal': 'bg-green-100 text-green-700',
      'Confirmação de Suspeitas': 'bg-blue-100 text-blue-700',
      'Atirar Pedras': 'bg-orange-100 text-orange-700',
      'Vitória Transformadora': 'bg-pink-100 text-pink-700',
      'Solução Única': 'bg-yellow-100 text-yellow-700',
      'Elefante na Sala': 'bg-red-100 text-red-700',
      'Ruptura Cognitiva': 'bg-indigo-100 text-indigo-700',
      'Concordar & Contrastar': 'bg-purple-100 text-purple-700',
    };
    return colorMap[code] || 'bg-gray-100 text-gray-700';
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">BRIO.IA</h2>
            <p className="text-sm text-gray-500">Conteúdo Magnético</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-gray-700">Histórico Recente</h3>
          <Clock className="w-4 h-4 text-gray-400" />
        </div>

        <ScrollArea className="flex-1">
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Sparkles className="w-6 h-6 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">Nenhuma geração ainda</p>
                <p className="text-xs text-gray-400 mt-1">Seus conteúdos aparecerão aqui</p>
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                >
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-2">
                    {item.topic}
                  </h4>
                  
                  <div className="flex items-center justify-between mb-2">
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getCodeColor(item.codes[0])}`}
                    >
                      {item.codes[0]}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {formatDistanceToNow(new Date(item.timestamp), { 
                        addSuffix: true, 
                        locale: ptBR 
                      })}
                    </span>
                  </div>
                  
                  {item.objective && (
                    <div className="text-xs text-gray-500 capitalize">
                      Objetivo: {item.objective}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Plano Pro</span>
            <span>{history.length}/100 conteúdos</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${Math.min((history.length / 100) * 100, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
