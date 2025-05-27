import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Copy, Eye, Check } from 'lucide-react';
import { useState } from 'react';
import { type ContentVariation } from '@shared/schema';
import { MAGNETIC_CODES } from '@/lib/magnetic-codes';
import { useToast } from '@/hooks/use-toast';

interface GeneratedContentCardProps {
  variation: ContentVariation;
}

export function GeneratedContentCard({ variation }: GeneratedContentCardProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { toast } = useToast();

  const codeInfo = MAGNETIC_CODES[variation.code];
  
  const getCardColorClasses = (color: string) => {
    const colorMap: Record<string, string> = {
      purple: 'from-purple-500 to-pink-500 bg-purple-100 text-purple-700',
      orange: 'from-orange-500 to-red-500 bg-orange-100 text-orange-700',
      blue: 'from-blue-500 to-cyan-500 bg-blue-100 text-blue-700',
      green: 'from-green-500 to-emerald-500 bg-green-100 text-green-700',
      yellow: 'from-yellow-500 to-orange-500 bg-yellow-100 text-yellow-700',
      red: 'from-red-500 to-pink-500 bg-red-100 text-red-700',
      indigo: 'from-indigo-500 to-purple-500 bg-indigo-100 text-indigo-700',
      pink: 'from-pink-500 to-rose-500 bg-pink-100 text-pink-700',
    };
    return colorMap[color] || 'from-gray-500 to-gray-600 bg-gray-100 text-gray-700';
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(variation.content);
      setIsCopied(true);
      
      toast({
        title: "Conteúdo copiado!",
        description: "O texto foi copiado para sua área de transferência.",
      });
      
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
        variant: "destructive",
      });
    }
  };

  const colorClasses = getCardColorClasses(codeInfo?.color || 'gray');
  const [gradientColors, badgeColors] = colorClasses.split(' bg-');

  return (
    <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 bg-gradient-to-r ${gradientColors} rounded-xl flex items-center justify-center`}>
              <span className="text-white text-lg">{codeInfo?.icon || '📝'}</span>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{variation.code}</h3>
              <p className="text-sm text-gray-500">{codeInfo?.description || 'Código magnético'}</p>
            </div>
          </div>
          <Badge 
            variant="secondary" 
            className={`bg-${badgeColors} text-xs font-medium`}
          >
            Código: {variation.code}
          </Badge>
        </div>
        
        <div className="prose max-w-none mb-6">
          <p className="text-gray-800 leading-relaxed whitespace-pre-line">
            {variation.content}
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{variation.wordCount} palavras</span>
            </div>
            <div>
              Tom: {variation.tone}
            </div>
          </div>
          
          <Button
            onClick={handleCopy}
            variant="outline"
            size="sm"
            className={`transition-all duration-200 ${
              isCopied 
                ? 'bg-green-500 text-white border-green-500 hover:bg-green-600' 
                : 'hover:bg-gray-50'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 mr-2" />
                Copiar
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
