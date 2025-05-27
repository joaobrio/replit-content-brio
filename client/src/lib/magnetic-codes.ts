export interface MagneticCode {
  name: string;
  structure: string;
  icon: string;
  color: string;
  description: string;
  whenToUse: string;
}

export const MAGNETIC_CODES: Record<string, MagneticCode> = {
  'Concordar & Contrastar': {
    name: 'Concordar & Contrastar',
    structure: 'Sim, [crença comum] é importante, E TAMBÉM [nova perspectiva]',
    icon: '🤝',
    color: 'purple',
    description: 'Educa sem confrontar',
    whenToUse: 'Para validar crenças existentes enquanto introduz novas perspectivas'
  },
  'Atirar Pedras': {
    name: 'Atirar Pedras',
    structure: 'Enquanto [prática ruim] ainda é comum, a ciência mostra que [abordagem melhor]',
    icon: '🎯',
    color: 'orange',
    description: 'Posiciona contra práticas ultrapassadas',
    whenToUse: 'Para se diferenciar criticando métodos antigos ou ineficazes'
  },
  'Confirmação de Suspeitas': {
    name: 'Confirmação de Suspeitas',
    structure: 'Você sempre suspeitou que [intuição]? Você estava certo: [evidência]',
    icon: '✅',
    color: 'blue',
    description: 'Valida intuições do público',
    whenToUse: 'Quando o público já tem suspeitas sobre algo que você pode confirmar'
  },
  'História Pessoal': {
    name: 'História Pessoal',
    structure: '[Momento vulnerável] + [Aprendizado] + [Transformação]',
    icon: '❤️',
    color: 'green',
    description: 'Cria conexão emocional',
    whenToUse: 'Para humanizar sua marca e criar conexão emocional profunda'
  },
  'Solução Única': {
    name: 'Solução Única',
    structure: 'Desenvolvi o [Nome do Método] que [Benefício único]',
    icon: '💡',
    color: 'yellow',
    description: 'Apresenta seu diferencial',
    whenToUse: 'Para destacar métodos ou soluções exclusivas que você desenvolveu'
  },
  'Elefante na Sala': {
    name: 'Elefante na Sala',
    structure: 'Vamos falar sobre o que ninguém menciona: [tabu] é real e [solução]',
    icon: '🐘',
    color: 'red',
    description: 'Aborda tabus',
    whenToUse: 'Para discutir temas polêmicos ou desconfortáveis que todos evitam'
  },
  'Ruptura Cognitiva': {
    name: 'Ruptura Cognitiva',
    structure: '[Crença estabelecida] está errada. Na verdade, [novo paradigma]',
    icon: '💥',
    color: 'indigo',
    description: 'Quebra paradigmas',
    whenToUse: 'Para desafiar crenças amplamente aceitas com informações surpreendentes'
  },
  'Vitória Transformadora': {
    name: 'Vitória Transformadora',
    structure: '[Nome] estava [situação ruim], hoje [transformação incrível]',
    icon: '🏆',
    color: 'pink',
    description: 'Inspira com resultados',
    whenToUse: 'Para mostrar transformações reais e inspirar ação'
  }
};

export const OBJECTIVES = {
  captar: {
    name: 'Captar',
    description: 'Atenção',
    icon: '🧲',
    color: 'purple'
  },
  conectar: {
    name: 'Conectar',
    description: 'Emoção',
    icon: '❤️',
    color: 'pink'
  },
  convencer: {
    name: 'Convencer',
    description: 'Lógica',
    icon: '💡',
    color: 'blue'
  },
  converter: {
    name: 'Converter',
    description: 'Ação',
    icon: '🎯',
    color: 'green'
  }
};

export function selectBestCode(objective: string): string[] {
  const codeMapping = {
    'captar': ['Confirmação de Suspeitas', 'Ruptura Cognitiva', 'Elefante na Sala'],
    'conectar': ['História Pessoal', 'Concordar & Contrastar', 'Vitória Transformadora'],
    'convencer': ['Atirar Pedras', 'Solução Única', 'Confirmação de Suspeitas'],
    'converter': ['Vitória Transformadora', 'Solução Única', 'História Pessoal']
  };
  
  return codeMapping[objective as keyof typeof codeMapping] || codeMapping['captar'];
}
