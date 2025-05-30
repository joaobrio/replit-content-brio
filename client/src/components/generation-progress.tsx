import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2, Clock, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GenerationStep {
  id: string;
  label: string;
  description: string;
  estimatedTime: number; // em segundos
  completed: boolean;
  active: boolean;
}

interface GenerationProgressProps {
  isGenerating: boolean;
  onComplete?: () => void;
}

export function GenerationProgress({ isGenerating, onComplete }: GenerationProgressProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [estimatedTotal, setEstimatedTotal] = useState(45);

  const steps: GenerationStep[] = [
    {
      id: 'analyzing',
      label: 'Analisando o tema',
      description: 'Processando e compreendendo o contexto do seu conteúdo',
      estimatedTime: 8,
      completed: false,
      active: false
    },
    {
      id: 'selecting-codes',
      label: 'Selecionando códigos magnéticos',
      description: 'Escolhendo os melhores códigos para o seu objetivo',
      estimatedTime: 12,
      completed: false,
      active: false
    },
    {
      id: 'generating-content',
      label: 'Gerando variações',
      description: 'Criando 3 versões únicas do seu conteúdo',
      estimatedTime: 20,
      completed: false,
      active: false
    },
    {
      id: 'optimizing',
      label: 'Otimizando resultados',
      description: 'Ajustando tom, contagem de palavras e estrutura',
      estimatedTime: 5,
      completed: false,
      active: false
    }
  ];

  useEffect(() => {
    if (!isGenerating) {
      setCurrentStep(0);
      setProgress(0);
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isGenerating]);

  useEffect(() => {
    if (!isGenerating) return;

    let stepIndex = 0;
    let totalProgress = 0;

    const stepInterval = setInterval(() => {
      if (stepIndex < steps.length) {
        const step = steps[stepIndex];
        
        // Simular progresso da etapa atual
        const stepProgress = Math.min(100, (elapsedTime / step.estimatedTime) * 100);
        
        // Calcular progresso total
        const completedStepsProgress = stepIndex * 25; // 25% por etapa
        const currentStepProgress = (stepProgress / 100) * 25;
        totalProgress = Math.min(95, completedStepsProgress + currentStepProgress);
        
        setProgress(totalProgress);
        setCurrentStep(stepIndex);

        // Avançar para próxima etapa quando completar
        if (stepProgress >= 100) {
          stepIndex++;
        }
      }
    }, 500);

    return () => clearInterval(stepInterval);
  }, [isGenerating, elapsedTime]);

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getRemainingTime = () => {
    const remaining = Math.max(0, estimatedTotal - elapsedTime);
    return remaining;
  };

  if (!isGenerating) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gerando Conteúdo Magnético</h3>
                <p className="text-sm text-gray-600">Processando com IA avançada...</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              <span>~{formatTime(getRemainingTime())} restante</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                Progresso: {Math.round(progress)}%
              </span>
              <span className="text-sm text-gray-500">
                {formatTime(elapsedTime)} / {formatTime(estimatedTotal)}
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Steps */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const isCompleted = index < currentStep;
              const isActive = index === currentStep;
              const isUpcoming = index > currentStep;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "flex items-start space-x-3 p-3 rounded-lg transition-all duration-300",
                    isActive && "bg-purple-100 border border-purple-200",
                    isCompleted && "bg-green-50 border border-green-200",
                    isUpcoming && "bg-gray-50 opacity-60"
                  )}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : isActive ? (
                      <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                    ) : (
                      <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm font-medium",
                      isCompleted && "text-green-800",
                      isActive && "text-purple-800",
                      isUpcoming && "text-gray-600"
                    )}>
                      {step.label}
                    </p>
                    <p className={cn(
                      "text-xs mt-1",
                      isCompleted && "text-green-600",
                      isActive && "text-purple-600",
                      isUpcoming && "text-gray-500"
                    )}>
                      {step.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={cn(
                      "text-xs px-2 py-1 rounded-full",
                      isCompleted && "bg-green-100 text-green-700",
                      isActive && "bg-purple-100 text-purple-700",
                      isUpcoming && "bg-gray-100 text-gray-600"
                    )}>
                      {step.estimatedTime}s
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Sparkles className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Dica Bônus:</p>
                <p>Enquanto seu conteúdo está sendo gerado, que tal definir o próximo tema? 
                   A IA está aplicando neurociência comportamental para maximizar o engajamento!</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}