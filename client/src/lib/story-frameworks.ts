import { StoryFramework, StorySequence } from "@shared/schema";

export const STORY_FRAMEWORKS: Record<string, StoryFramework> = {
  "5R": {
    id: "5R",
    name: "Framework 5R",
    description: "Estrutura completa para stories educativos e de autoridade",
    slideCount: 5,
    structure: [
      "Relevância - Quem sou eu?",
      "Reflexão - Que transformação posso provocar?",
      "Relacionamento - Como gero identificação?",
      "Repertório - Como educo meu público?",
      "Resultado - Como atrair o público ideal?"
    ],
    bestFor: ["Autoridade", "Educação", "Posicionamento"],
    examples: [
      "Apresentação profissional",
      "Educação sobre especialidade",
      "Construção de autoridade"
    ]
  },
  "VLOG": {
    id: "VLOG",
    name: "Story Vlog",
    description: "Formato íntimo e pessoal para conexão emocional",
    slideCount: 4,
    structure: [
      "Abertura - Hook inicial",
      "Desenvolvimento - Narrativa pessoal",
      "Clímax - Momento de transformação",
      "Fechamento - Reflexão e conexão"
    ],
    bestFor: ["Conexão", "Humanização", "Storytelling"],
    examples: [
      "Dia a dia profissional",
      "Histórias pessoais",
      "Bastidores da profissão"
    ]
  },
  "TRANSFORMATION": {
    id: "TRANSFORMATION",
    name: "Vitória Transformadora",
    description: "Cases de sucesso e transformações de clientes",
    slideCount: 6,
    structure: [
      "Situação inicial - Problema/dor",
      "Contexto - Dificuldades enfrentadas",
      "Solução - Intervenção aplicada",
      "Processo - Jornada de transformação",
      "Resultado - Conquista alcançada",
      "Aprendizado - Lição para o público"
    ],
    bestFor: ["Conversão", "Prova social", "Resultados"],
    examples: [
      "Casos de pacientes",
      "Transformações reais",
      "Antes e depois"
    ]
  },
  "CONTRAPOPULAR": {
    id: "CONTRAPOPULAR",
    name: "Opinião Contrapopular",
    description: "Quebra de paradigmas e posicionamentos únicos",
    slideCount: 5,
    structure: [
      "Mito popular - O que todo mundo acredita",
      "Ruptura - Por que isso está errado",
      "Evidência - Dados e experiência",
      "Verdade - O que realmente funciona",
      "Ação - O que fazer na prática"
    ],
    bestFor: ["Diferenciação", "Autoridade", "Engajamento"],
    examples: [
      "Desmistificação de crenças",
      "Posicionamentos únicos",
      "Quebra de paradigmas"
    ]
  },
  "RITUAL": {
    id: "RITUAL",
    name: "Ritual Diário",
    description: "Rotinas e hábitos para melhor qualidade de vida",
    slideCount: 4,
    structure: [
      "Problema - Dificuldade comum",
      "Solução - Ritual proposto",
      "Como fazer - Passo a passo",
      "Benefícios - Resultados esperados"
    ],
    bestFor: ["Praticidade", "Engajamento", "Valor"],
    examples: [
      "Rotinas de saúde",
      "Hábitos profissionais",
      "Práticas diárias"
    ]
  }
};

export const STORY_SEQUENCES: Record<string, StorySequence> = {
  SEMANA_CAPTACAO: {
    id: "SEMANA_CAPTACAO",
    name: "Semana de Captação",
    description: "Estratégia focada em atrair novos seguidores",
    duration: "semana",
    stories: [
      { day: "Segunda", framework: "5R", objective: "CONVENCER", magneticCode: "CONFIRMACAO_SUSPEITAS" },
      { day: "Terça", framework: "CONTRAPOPULAR", objective: "CONVENCER", magneticCode: "ELEFANTE_NA_SALA" },
      { day: "Quarta", framework: "VLOG", objective: "CONECTAR", magneticCode: "HISTORIA_PESSOAL" },
      { day: "Quinta", framework: "RITUAL", objective: "CONECTAR", magneticCode: "SOLUCAO_UNICA" },
      { day: "Sexta", framework: "TRANSFORMATION", objective: "CONVERTER", magneticCode: "VITORIA_TRANSFORMADORA" },
      { day: "Sábado", framework: "5R", objective: "CAPTAR", magneticCode: "RUPTURA_COGNITIVA" },
      { day: "Domingo", framework: "VLOG", objective: "CAPTAR", magneticCode: "SEGREDO_REVELADO" }
    ]
  },
  LANCAMENTO_SERVICO: {
    id: "LANCAMENTO_SERVICO",
    name: "Lançamento de Serviço",
    description: "Sequência para apresentar novo serviço ou consulta",
    duration: "duas_semanas",
    stories: [
      // Semana 1 - Aquecimento
      { day: "Segunda S1", framework: "5R", objective: "CONVENCER", magneticCode: "CONFIRMACAO_SUSPEITAS" },
      { day: "Terça S1", framework: "CONTRAPOPULAR", objective: "CONVENCER", magneticCode: "ELEFANTE_NA_SALA" },
      { day: "Quarta S1", framework: "TRANSFORMATION", objective: "CONECTAR", magneticCode: "VITORIA_TRANSFORMADORA" },
      { day: "Quinta S1", framework: "VLOG", objective: "CONECTAR", magneticCode: "HISTORIA_PESSOAL" },
      { day: "Sexta S1", framework: "RITUAL", objective: "CONECTAR", magneticCode: "SOLUCAO_UNICA" },
      // Semana 2 - Lançamento
      { day: "Segunda S2", framework: "TRANSFORMATION", objective: "CONVERTER", magneticCode: "VITORIA_TRANSFORMADORA" },
      { day: "Terça S2", framework: "5R", objective: "CONVERTER", magneticCode: "SEGREDO_REVELADO" },
      { day: "Quarta S2", framework: "CONTRAPOPULAR", objective: "CONVERTER", magneticCode: "MOVIMENTO_RESISTENCIA" },
      { day: "Quinta S2", framework: "VLOG", objective: "CONVERTER", magneticCode: "HISTORIA_PESSOAL" },
      { day: "Sexta S2", framework: "TRANSFORMATION", objective: "CONVERTER", magneticCode: "VITORIA_TRANSFORMADORA" }
    ]
  },
  EDUCACAO_CONTINUADA: {
    id: "EDUCACAO_CONTINUADA",
    name: "Educação Continuada",
    description: "Conteúdo educativo semanal para autoridade",
    duration: "mes",
    stories: [
      // Semana 1
      { day: "Segunda", framework: "5R", objective: "CONVENCER", magneticCode: "CONFIRMACAO_SUSPEITAS" },
      { day: "Quinta", framework: "RITUAL", objective: "CONECTAR", magneticCode: "SOLUCAO_UNICA" },
      // Semana 2
      { day: "Segunda", framework: "CONTRAPOPULAR", objective: "CONVENCER", magneticCode: "ELEFANTE_NA_SALA" },
      { day: "Quinta", framework: "5R", objective: "CONECTAR", magneticCode: "SEGREDO_REVELADO" },
      // Semana 3
      { day: "Segunda", framework: "TRANSFORMATION", objective: "CONVENCER", magneticCode: "VITORIA_TRANSFORMADORA" },
      { day: "Quinta", framework: "VLOG", objective: "CONECTAR", magneticCode: "HISTORIA_PESSOAL" },
      // Semana 4
      { day: "Segunda", framework: "5R", objective: "CONVERTER", magneticCode: "MOVIMENTO_RESISTENCIA" },
      { day: "Quinta", framework: "RITUAL", objective: "CONVERTER", magneticCode: "RUPTURA_COGNITIVA" }
    ]
  }
};

export function selectBestFramework(objective: string, magneticCode: string): string {
  // Lógica para selecionar o melhor framework baseado no objetivo e código magnético
  const frameworkMap: Record<string, string[]> = {
    "CAPTAR": ["CONTRAPOPULAR", "5R", "VLOG"],
    "CONECTAR": ["VLOG", "RITUAL", "5R"],
    "CONVENCER": ["5R", "CONTRAPOPULAR", "TRANSFORMATION"],
    "CONVERTER": ["TRANSFORMATION", "5R", "CONTRAPOPULAR"]
  };

  const codeFrameworkMap: Record<string, string[]> = {
    "CONFIRMACAO_SUSPEITAS": ["5R", "CONTRAPOPULAR"],
    "HISTORIA_PESSOAL": ["VLOG", "TRANSFORMATION"],
    "ELEFANTE_NA_SALA": ["CONTRAPOPULAR", "5R"],
    "VITORIA_TRANSFORMADORA": ["TRANSFORMATION", "VLOG"],
    "RUPTURA_COGNITIVA": ["CONTRAPOPULAR", "5R"],
    "SOLUCAO_UNICA": ["RITUAL", "5R"],
    "SEGREDO_REVELADO": ["5R", "VLOG"],
    "MOVIMENTO_RESISTENCIA": ["CONTRAPOPULAR", "TRANSFORMATION"]
  };

  const objectiveOptions = frameworkMap[objective] || ["5R"];
  const codeOptions = codeFrameworkMap[magneticCode] || ["5R"];
  
  // Encontra o framework que aparece em ambas as listas
  const intersection = objectiveOptions.filter(fw => codeOptions.includes(fw));
  
  return intersection[0] || objectiveOptions[0] || "5R";
}

export function getFrameworkPrompt(framework: string, slideIndex: number): string {
  const prompts: Record<string, string[]> = {
    "5R": [
      "Crie conteúdo sobre RELEVÂNCIA: Apresente quem você é profissionalmente de forma magnética",
      "Crie conteúdo sobre REFLEXÃO: Explique que transformação você pode provocar na vida das pessoas",
      "Crie conteúdo sobre RELACIONAMENTO: Mostre como você gera identificação com seu público",
      "Crie conteúdo sobre REPERTÓRIO: Eduque seu público sobre sua área de especialidade",
      "Crie conteúdo sobre RESULTADO: Demonstre como você atrai o público ideal"
    ],
    "VLOG": [
      "Crie uma ABERTURA envolvente: Hook inicial que desperta curiosidade",
      "Desenvolva a NARRATIVA: Conte uma história pessoal relevante",
      "Mostre o CLÍMAX: O momento de transformação ou aprendizado",
      "Faça o FECHAMENTO: Reflexão que conecta com o público"
    ],
    "TRANSFORMATION": [
      "Apresente a SITUAÇÃO INICIAL: O problema ou dor do cliente",
      "Descreva o CONTEXTO: As dificuldades específicas enfrentadas",
      "Explique a SOLUÇÃO: A intervenção ou abordagem aplicada",
      "Narre o PROCESSO: A jornada de transformação",
      "Revele o RESULTADO: A conquista alcançada",
      "Compartilhe o APRENDIZADO: A lição para o público"
    ],
    "CONTRAPOPULAR": [
      "Apresente o MITO POPULAR: O que todo mundo acredita sobre o tema",
      "Provoque a RUPTURA: Por que essa crença está errada",
      "Forneça EVIDÊNCIAS: Dados e experiência que comprovam seu ponto",
      "Revele a VERDADE: O que realmente funciona",
      "Indique a AÇÃO: O que o público deve fazer na prática"
    ],
    "RITUAL": [
      "Identifique o PROBLEMA: Uma dificuldade comum do público",
      "Apresente a SOLUÇÃO: O ritual ou hábito proposto",
      "Explique COMO FAZER: Passo a passo prático",
      "Mostre os BENEFÍCIOS: Resultados esperados com a prática"
    ]
  };

  return prompts[framework]?.[slideIndex] || "Crie conteúdo relevante para este slide";
}