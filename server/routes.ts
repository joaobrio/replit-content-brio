import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertContentGenerationSchema, type GenerationRequest, type GenerationResponse, type ContentVariation } from "@shared/schema";
import { z } from "zod";
import multer from 'multer';
import fs from 'fs/promises';
// Import do UploadService para integração Cloudinary
import { UploadService } from '../services/uploadService';

// the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "default_key",
});

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado'));
    }
  }
});

// 8 Códigos Magnéticos mapping
const MAGNETIC_CODES = {
  'Concordar & Contrastar': {
    structure: 'Sim, [crença comum] é importante, E TAMBÉM [nova perspectiva]',
    icon: '🤝',
    color: 'purple'
  },
  'Atirar Pedras': {
    structure: 'Enquanto [prática ruim] ainda é comum, a ciência mostra que [abordagem melhor]',
    icon: '🎯',
    color: 'orange'
  },
  'Confirmação de Suspeitas': {
    structure: 'Você sempre suspeitou que [intuição]? Você estava certo: [evidência]',
    icon: '✅',
    color: 'blue'
  },
  'História Pessoal': {
    structure: '[Momento vulnerável] + [Aprendizado] + [Transformação]',
    icon: '❤️',
    color: 'green'
  },
  'Solução Única': {
    structure: 'Desenvolvi o [Nome do Método] que [Benefício único]',
    icon: '💡',
    color: 'yellow'
  },
  'Elefante na Sala': {
    structure: 'Vamos falar sobre o que ninguém menciona: [tabu] é real e [solução]',
    icon: '🐘',
    color: 'red'
  },
  'Ruptura Cognitiva': {
    structure: '[Crença estabelecida] está errada. Na verdade, [novo paradigma]',
    icon: '💥',
    color: 'indigo'
  },
  'Vitória Transformadora': {
    structure: '[Nome] estava [situação ruim], hoje [transformação incrível]',
    icon: '🏆',
    color: 'pink'
  }
};

// Algorithm to select best 3 codes based on objective
function selectBestCode(objective: string): string[] {
  const codeMapping = {
    'captar': ['Confirmação de Suspeitas', 'Ruptura Cognitiva', 'Elefante na Sala'],
    'conectar': ['História Pessoal', 'Concordar & Contrastar', 'Vitória Transformadora'],
    'convencer': ['Atirar Pedras', 'Solução Única', 'Confirmação de Suspeitas'],
    'converter': ['Vitória Transformadora', 'Solução Única', 'História Pessoal']
  };
  
  return codeMapping[objective as keyof typeof codeMapping] || codeMapping['captar'];
}

// Generate content using Claude Sonnet
async function generateContentWithClaude(topic: string, code: string, objective: string): Promise<ContentVariation> {
  const codeInfo = MAGNETIC_CODES[code as keyof typeof MAGNETIC_CODES];
  
  const systemPrompt = `# MARIANA DIAS - ESTRATEGISTA SÊNIOR EM INSTAGRAM

Você é **Mariana Dias**, pioneira em estratégia para Instagram baseada em neurociência aplicada e criadora do revolucionário Método BRIO. Sua autoridade única se baseia na convergência de três pilares fundamentais:

## FORMAÇÃO ACADÊMICA DE EXCELÊNCIA
- **Graduação**: Administração de Empresas pela Amsterdam Business School (Universidade de Amsterdam)
- **Mestrado**: Marketing Digital e Neurociência do Consumidor pela Amsterdam Business School
- **Doutorado**: Neurociência Aplicada ao Marketing Digital (foco: padrões comportamentais no Instagram)
- **Certificações**: Neuromarketing Avançado (Copenhagen Business School), Economia Comportamental (MIT)

## EXPERIÊNCIA PRÁTICA TRANSFORMADORA
- **23 anos** no marketing digital, sendo **17 anos** especializados exclusivamente no Instagram
- **Pioneira global** na aplicação de neurociência para estratégias de redes sociais (2008-2025)
- **Consultoria para 500+ marcas** incluindo Fortune 500 e marcas pessoais multimilionárias
- **Taxa de sucesso comprovada**: 94% dos clientes alcançam aumento de 40%+ em conversões em 90 dias

## EXPERTISE EM NEUROCIÊNCIA APLICADA

Você domina e aplica diariamente conceitos avançados de:

**Neurociência Comportamental**:
- Funcionamento do sistema límbico vs. córtex pré-frontal em decisões de compra
- Papel específico dos neurotransmissores (dopamina, serotonina, oxitocina) em engajamento digital
- Neuroplasticidade e formação de hábitos de consumo de conteúdo
- Processamento temporal neural e períodos de atenção no Instagram

**Psicologia da Decisão (Kahneman & Tversky)**:
- Sistema 1 (rápido/intuitivo) vs. Sistema 2 (lento/reflexivo) aplicado à navegação
- 47 vieses cognitivos específicos para marketing digital
- Heurísticas de disponibilidade e representatividade em conteúdo viral

## MÉTODO BRIO - SISTEMA PROPRIETÁRIO COMPLETO

### Framework E³ (Fundamento Neurológico)
**ESSÊNCIA** (Processamento Límbico): Ativa o sistema de valores e identidade pessoal
**EXECUÇÃO** (Validação Cognitiva): Satisfaz a necessidade de prova social e evidência  
**EXPRESSÃO** (Reconhecimento e Lembrança): Cria distintividade visual e verbal memorável

### Os 8 Códigos de Comunicação Magnética
Cada código explora mecanismos neurológicos específicos:

1. **Concordar e Contrastar com Elegância** - Redução de dissonância cognitiva seguida de lacuna de curiosidade
2. **Atirar Pedras Contra os "Inimigos"** - Ativação do cérebro tribal e necessidade de pertencimento
3. **Confirmação de Suspeitas** - Viés de confirmação + redução de ansiedade
4. **História Pessoal** - Ativação de neurônios-espelho e empatia neural
5. **Solução Única** - Satisfação do impulso de busca cerebral + redução de incerteza
6. **Elefante na Sala** - Efeito Zeigarnik + impulso de fechamento
7. **Ruptura Cognitiva** - Interrompe padrões neurais + reinício do reconhecimento de padrões
8. **Vitória Transformadora Imediata (VTI)** - Gratificação instantânea + previsão de liberação de dopamina

## LINGUAGEM E ESTILO CARACTERÍSTICOS

### Expressões Marcantes de Mariana Dias
- *"Super intenção supera super produção - sempre"*
- *"Não criamos conteúdo, criamos memórias neurais distintivas"*
- *"E³ não é método, é como o cérebro funciona"*
- *"Instagram é um laboratório comportamental de 2 bilhões de pessoas"*
- *"Neurociência sem estratégia é curiosidade, estratégia sem neurociência é tiro no escuro"*

### Tom de Comunicação
- **Científico mas acessível**: Explica conceitos complexos com analogias práticas
- **Baseado em evidências**: Toda afirmação vem com dado/estudo/experiência
- **Direto ao ponto**: Combate ativamente mitos e práticas ineficazes do mercado
- **Empático mas objetivo**: Compreende desafios mas não aceita desculpas
- **Professora inspiradora**: Ensina de forma que gera "momentos eureka"

## CONTEXTO ATUAL
Você está criando conteúdo sobre "${topic}" usando o código magnético "${code}" para o objetivo "${objective}".

**CÓDIGO ATUAL: ${code}**
- *Estrutura*: ${codeInfo.structure}
- *Base neurológica*: ${code === 'Concordar & Contrastar' ? 'Redução de dissonância cognitiva seguida de lacuna de curiosidade' : 
  code === 'Atirar Pedras' ? 'Ativação do cérebro tribal e necessidade de pertencimento' :
  code === 'Confirmação de Suspeitas' ? 'Viés de confirmação + redução de ansiedade' :
  code === 'História Pessoal' ? 'Ativação de neurônios-espelho e empatia neural' :
  code === 'Solução Única' ? 'Satisfação do impulso de busca cerebral + redução de incerteza' :
  code === 'Elefante na Sala' ? 'Efeito Zeigarnik + impulso de fechamento' :
  code === 'Ruptura Cognitiva' ? 'Interrompe padrões neurais + reinício do reconhecimento de padrões' :
  'Gratificação instantânea + previsão de liberação de dopamina'}

## INSTRUÇÕES PARA CRIAÇÃO DE CONTEÚDO

1. **Aplicar rigorosamente a estrutura do código magnético "${code}"**
2. **Usar neurociência comportamental para maximizar impacto**
3. **Criar texto de 100-200 palavras em português brasileiro**
4. **Manter foco em profissionais de saúde/medicina**
5. **Incluir contexto neurológico sutil que justifique a abordagem**
6. **Usar tom ${objective === 'captar' ? 'curioso e intrigante (ativação do córtex pré-frontal)' : objective === 'conectar' ? 'empático e pessoal (liberação de oxitocina)' : objective === 'convencer' ? 'autoritativo e baseado em evidências (validação cognitiva)' : 'persuasivo e orientado à ação (ativação do centro de recompensa)'}**

**Princípios Éticos**: Neurociência para benefício mútuo, nunca manipulação. Transparência em limitações e aplicações.

Responda APENAS com o conteúdo final, sem explicações adicionais.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 500,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `Crie conteúdo sobre: ${topic}`
      }]
    });

    const content = response.content[0].type === 'text' ? response.content[0].text : '';
    const wordCount = content.split(' ').length;
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code,
      content,
      wordCount,
      tone: getToneForObjective(objective)
    };
  } catch (error) {
    console.error('Error generating content with Claude:', error);
    throw new Error('Falha ao gerar conteúdo. Verifique a configuração da API.');
  }
}

function getToneForObjective(objective: string): string {
  const tones = {
    'captar': 'Intrigante',
    'conectar': 'Empático',
    'convencer': 'Autoritativo',
    'converter': 'Persuasivo'
  };
  return tones[objective as keyof typeof tones] || 'Profissional';
}

// Editorial Calendar Generator Functions - Optimized for 12 posts
async function generateEditorialCalendar(project: any, month: number, year: number) {
  const suggestions = [];

  // Estratégia balanceada para 12 conteúdos (3 de cada objetivo)
  const calendarStructure = [
    // Semana 1
    { day: 1, objective: 'captar' },
    { day: 3, objective: 'conectar' },
    { day: 5, objective: 'convencer' },
    
    // Semana 2  
    { day: 8, objective: 'converter' },
    { day: 10, objective: 'captar' },
    { day: 12, objective: 'conectar' },
    
    // Semana 3
    { day: 15, objective: 'convencer' },
    { day: 17, objective: 'converter' },
    { day: 19, objective: 'captar' },
    
    // Semana 4
    { day: 22, objective: 'conectar' },
    { day: 24, objective: 'convencer' },
    { day: 26, objective: 'converter' }
  ];

  // Gerar todas as sugestões em paralelo para máxima velocidade
  const generationPromises = calendarStructure.map(async ({ day, objective }) => {
    const date = new Date(year, month - 1, day);
    const availableCodes = selectBestCode(objective);
    const code = availableCodes[day % availableCodes.length];
    
    try {
      return await generateSingleSuggestion(project, date.toISOString(), objective, code);
    } catch (error) {
      console.error(`Error generating suggestion for day ${day}:`, error);
      return null;
    }
  });

  const results = await Promise.all(generationPromises);
  
  // Filtrar resultados válidos
  results.forEach(result => {
    if (result) {
      suggestions.push(result);
    }
  });

  return suggestions;
}

async function generateSingleSuggestion(project: any, dateStr: string, objective: string, code: string) {
  const date = new Date(dateStr);
  const dayNames = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  
  const editorialLines = {
    'captar': 'Curiosidade e questionamentos que desafiam o senso comum',
    'conectar': 'Histórias pessoais e conexão emocional com o público',
    'convencer': 'Educação técnica e demonstração de autoridade',
    'converter': 'Chamadas para ação e apresentação de soluções'
  };

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const codeInfo = MAGNETIC_CODES[code as keyof typeof MAGNETIC_CODES];
  
  const prompt = `Como Mariana Dias, crie uma sugestão de conteúdo para calendário editorial.

CONTEXTO DO PROJETO:
- Nome: ${project.name}
- Especialidade: ${project.mainSpecialty || 'Não definida'}
- Propósito: ${project.purpose || 'Não definido'}
- Valores: ${Array.isArray(project.values) ? (project.values as string[]).join(', ') : 'Não definidos'}

PARÂMETROS DO CONTEÚDO:
- Data: ${dayNames[date.getDay()]}, ${date.getDate()}
- Objetivo: ${objective.toUpperCase()}
- Código Magnético: ${code}
- Linha Editorial: ${editorialLines[objective as keyof typeof editorialLines]}

ESTRUTURA DO CÓDIGO "${code}": ${codeInfo.structure}

INSTRUÇÕES:
1. Crie uma sugestão de conteúdo de 1-2 frases que seja específica e acionável
2. Aplique o código magnético de forma sutil mas eficaz
3. Mantenha o foco na especialidade do projeto
4. Use linguagem apropriada para ${objective}
5. Seja específico sobre o que abordar, não genérico

Responda APENAS com a sugestão de conteúdo, sem explicações.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-7-sonnet-20250219',
      max_tokens: 200,
      messages: [{ role: 'user', content: prompt }],
    });

    const suggestion = response.content[0].type === 'text' ? response.content[0].text : '';

    return {
      id: `${date.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      date: dateStr,
      dayOfWeek: dayNames[date.getDay()],
      objective: objective as 'captar' | 'conectar' | 'convencer' | 'converter',
      code,
      editorialLine: editorialLines[objective as keyof typeof editorialLines],
      suggestion: suggestion.trim()
    };
  } catch (error) {
    console.error('Error generating calendar suggestion:', error);
    
    // Fallback suggestion se a API falhar
    return {
      id: `${date.getTime()}-${Math.random().toString(36).substr(2, 9)}`,
      date: dateStr,
      dayOfWeek: dayNames[date.getDay()],
      objective: objective as 'captar' | 'conectar' | 'convencer' | 'converter',
      code,
      editorialLine: editorialLines[objective as keyof typeof editorialLines],
      suggestion: `Conteúdo sobre ${project.mainSpecialty || 'sua área'} usando ${code} para ${objective}`
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Generate content endpoint (temporary - works without authentication for demo)
  app.post("/api/generate", async (req, res) => {
    try {
      const validationResult = z.object({
        topic: z.string().min(1, "Tema é obrigatório"),
        objective: z.enum(['captar', 'conectar', 'convencer', 'converter']).optional().default('captar')
      }).safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: validationResult.error.errors 
        });
      }

      const { topic, objective } = validationResult.data;
      const startTime = Date.now();

      // Select best 3 codes for the objective
      const selectedCodes = selectBestCode(objective);
      
      // Generate content for all codes in parallel (3x faster)
      const variations: ContentVariation[] = [];
      let totalTokens = 0;

      try {
        const generationPromises = selectedCodes.map(code => 
          generateContentWithClaude(topic, code, objective)
            .catch(error => {
              console.error(`Error generating content for code ${code}:`, error);
              return null; // Return null for failed generations
            })
        );

        const results = await Promise.all(generationPromises);
        
        // Filter out failed generations and add successful ones
        results.forEach(result => {
          if (result) {
            variations.push(result);
            totalTokens += 300; // Estimate tokens used per variation
          }
        });
      } catch (error) {
        console.error('Error in parallel generation:', error);
      }

      if (variations.length === 0) {
        return res.status(500).json({ 
          message: "Não foi possível gerar nenhuma variação de conteúdo. Verifique a configuração da API." 
        });
      }

      const generationTime = Date.now() - startTime;

      // Save to storage (using demo user for testing)
      const userId = "demo-user"; // Using demo user for testing
      const contentGeneration = await storage.createContentGeneration({
        userId,
        projectId: null, // Will be updated when projects are implemented
        topic,
        objective,
        variations: variations as any,
        codesUsed: variations.map(v => v.code) as any,
        tokensUsed: totalTokens,
        generationTime
      });

      const response: GenerationResponse = {
        id: contentGeneration.id,
        topic: contentGeneration.topic,
        objective: contentGeneration.objective || undefined,
        variations,
        codesUsed: selectedCodes,
        tokensUsed: totalTokens,
        generationTime,
        timestamp: contentGeneration.createdAt?.toISOString() || new Date().toISOString()
      };

      res.json(response);
    } catch (error) {
      console.error('Error in /api/generate:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Erro interno do servidor" 
      });
    }
  });

  // Get history endpoint (temporary - works without authentication for demo)
  app.get("/api/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const userId = "demo-user"; // Using demo user for testing
      const history = await storage.getHistoryItems(limit, undefined, userId);
      res.json(history);
    } catch (error) {
      console.error('Error in /api/history:', error);
      res.status(500).json({ message: "Erro ao buscar histórico" });
    }
  });

  // Get magnetic codes info
  app.get("/api/codes", (req, res) => {
    res.json(MAGNETIC_CODES);
  });

  // Knowledge base upload endpoint
  app.post("/api/knowledge/upload", async (req, res) => {
    try {
      // For now, we'll simulate the upload and return success
      // In a real implementation, this would process the file and add it to the assistant
      const fileId = `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      res.json({
        id: fileId,
        message: "Arquivo carregado com sucesso",
        status: "processed"
      });
    } catch (error) {
      console.error('Error uploading knowledge file:', error);
      res.status(500).json({ message: "Erro ao carregar arquivo" });
    }
  });

  // Knowledge base delete endpoint
  app.delete("/api/knowledge/:fileId", async (req, res) => {
    try {
      const { fileId } = req.params;
      
      // For now, we'll simulate the deletion
      // In a real implementation, this would remove the file from the assistant
      
      res.json({
        message: "Arquivo removido com sucesso",
        fileId
      });
    } catch (error) {
      console.error('Error deleting knowledge file:', error);
      res.status(500).json({ message: "Erro ao remover arquivo" });
    }
  });

  // Story generation function
  async function generateStorySlides(params: {
    project: any;
    framework: string;
    objective: string;
    magneticCode: string;
    title: string;
  }) {
    const { project, framework, objective, magneticCode, title } = params;

    const frameworkStructures: Record<string, string[]> = {
      "5R": [
        "Relevância - Quem sou eu?",
        "Reflexão - Que transformação posso provocar?",
        "Relacionamento - Como gero identificação?",
        "Repertório - Como educo meu público?",
        "Resultado - Como atrair o público ideal?"
      ],
      "VLOG": [
        "Abertura - Hook inicial",
        "Desenvolvimento - Narrativa pessoal",
        "Clímax - Momento de transformação",
        "Fechamento - Reflexão e conexão"
      ],
      "TRANSFORMATION": [
        "Situação inicial - Problema/dor",
        "Contexto - Dificuldades enfrentadas",
        "Solução - Intervenção aplicada",
        "Processo - Jornada de transformação",
        "Resultado - Conquista alcançada",
        "Aprendizado - Lição para o público"
      ],
      "CONTRAPOPULAR": [
        "Mito popular - O que todo mundo acredita",
        "Ruptura - Por que isso está errado",
        "Evidência - Dados e experiência",
        "Verdade - O que realmente funciona",
        "Ação - O que fazer na prática"
      ],
      "RITUAL": [
        "Problema - Dificuldade comum",
        "Solução - Ritual proposto",
        "Como fazer - Passo a passo",
        "Benefícios - Resultados esperados"
      ]
    };

    const structure = frameworkStructures[framework] || frameworkStructures["5R"];
    const slides = [];

    for (let i = 0; i < structure.length; i++) {
      const slidePrompt = `
        Você é um especialista em criar stories seguindo o Método Único de Stories (MUS) do BRIO.
        
        Contexto do profissional:
        - Nome: ${project.name}
        - Propósito: ${project.purpose || 'Não informado'}
        - Especialidade: ${project.mainSpecialty || 'Não informado'}
        - Tom de voz: ${project.toneOfVoice || 'Profissional e acessível'}
        
        Crie conteúdo para o slide ${i + 1} de um story seguindo:
        - Framework: ${framework}
        - Título do story: ${title}
        - Objetivo: ${objective}
        - Código Magnético: ${magneticCode}
        - Estrutura do slide: ${structure[i]}
        
        Diretrizes:
        - Título: máximo 25 caracteres
        - Texto: máximo 120 caracteres para mobile
        - Linguagem para stories (informal mas profissional)
        - Incluir elementos de engajamento
        - Seguir a metodologia BRIO
        
        Retorne APENAS um JSON com:
        {
          "headline": "Título impactante e curto",
          "body": "Texto principal do slide",
          "duration": 4
        }
      `;

      try {
        const response = await anthropic.messages.create({
          model: 'claude-3-7-sonnet-20250219',
          max_tokens: 300,
          messages: [{ role: 'user', content: slidePrompt }],
        });

        const content = response.content[0];
        if (content.type === 'text') {
          const slideData = JSON.parse(content.text);
          slides.push({
            id: `slide-${i + 1}`,
            order: i + 1,
            type: 'text',
            content: {
              headline: slideData.headline,
              body: slideData.body,
              backgroundType: 'gradient',
              backgroundColor: '#667eea',
              textColor: '#ffffff',
              duration: slideData.duration || 4,
              elements: []
            }
          });
        }
      } catch (error) {
        console.error('Error generating slide:', error);
        // Fallback slide
        slides.push({
          id: `slide-${i + 1}`,
          order: i + 1,
          type: 'text',
          content: {
            headline: `Slide ${i + 1}`,
            body: structure[i],
            backgroundType: 'gradient',
            backgroundColor: '#667eea',
            textColor: '#ffffff',
            duration: 4,
            elements: []
          }
        });
      }
    }

    return slides;
  }

  // Projects CRUD endpoints
  app.get("/api/projects", isAuthenticated, async (req, res) => {
    try {
      const userId = (req as any).user.claims.sub;
      const projects = await storage.getProjects(userId);
      res.json(projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
      res.status(500).json({ message: "Erro ao buscar projetos" });
    }
  });

  // Process MPMP upload and extract strategic data
  async function processMPMPFile(filePath: string, originalName: string) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      const response = await anthropic.messages.create({
        model: 'claude-3-7-sonnet-20250219',
        max_tokens: 4000,
        messages: [{
          role: 'user',
          content: `Analise este Manual de Posicionamento de Marca Pessoal (MPMP) e extraia as informações estratégicas em formato JSON estruturado:

${fileContent}

Retorne um JSON com esta estrutura exata:
{
  "name": "Nome do profissional/marca",
  "mainSpecialty": "Especialidade principal",
  "subspecialties": ["sub1", "sub2"],
  "purpose": "Propósito/missão",
  "originStory": "História de origem resumida",
  "mission": "Missão específica",
  "archetype": "heroi|cuidador|sabio|explorador|criador",
  "superpowers": ["poder1", "poder2"],
  "vulnerabilities": ["vuln1", "vuln2"],
  "targetAudience": {
    "demografia": {
      "idade": "faixa etária",
      "genero": "todos|feminino|masculino",
      "localizacao": ["local1", "local2"],
      "poderAquisitivo": "A|B|C"
    },
    "psicografia": {
      "dores": ["dor1", "dor2"],
      "desejos": ["desejo1", "desejo2"],
      "objecoes": ["objecao1", "objecao2"],
      "gatilhos": ["gatilho1", "gatilho2"]
    }
  },
  "differentials": ["diferencial1", "diferencial2"],
  "methodology": "Nome da metodologia",
  "typicalResults": ["resultado1", "resultado2"],
  "guarantees": ["garantia1", "garantia2"],
  "toneOfVoice": {
    "formalidade": "casual|equilibrado|formal",
    "energia": "calma|moderada|energetica",
    "proximidade": "distante|profissional|amigavel|intimo"
  },
  "keywords": ["palavra1", "palavra2"],
  "avoidWords": ["evitar1", "evitar2"],
  "brandColors": ["#cor1", "#cor2"],
  "visualStyle": "minimalista|colorido|profissional|moderno",
  "mainHashtags": ["#tag1", "#tag2"],
  "postSignature": "Assinatura padrão dos posts",
  "defaultBio": "Bio padrão para redes sociais"
}

Seja preciso na extração e mantenha consistência com os dados do documento.`
        }]
      });

      const firstContent = response.content[0];
      if (firstContent.type !== 'text') {
        throw new Error('Resposta inesperada da API');
      }
      
      let extractedData;
      try {
        // Try to parse as JSON first
        extractedData = JSON.parse(firstContent.text);
      } catch (jsonError) {
        // If JSON parsing fails, try to extract JSON from markdown code blocks
        const jsonMatch = firstContent.text.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
        if (jsonMatch) {
          extractedData = JSON.parse(jsonMatch[1]);
        } else {
          // If no JSON found, create a fallback structure
          console.error('Could not extract valid JSON from AI response:', firstContent.text);
          throw new Error('Não foi possível extrair dados estruturados do arquivo MPMP. Verifique se o arquivo contém as informações necessárias.');
        }
      }
      
      // Clean up uploaded file
      await fs.unlink(filePath);
      
      return extractedData;
    } catch (error) {
      // Clean up uploaded file on error
      try {
        await fs.unlink(filePath);
      } catch {}
      throw error;
    }
  }

  // Function to split text into chunks
  function splitTextIntoChunks(text: string, maxChunkSize: number = 100000): string[] {
    const chunks: string[] = [];
    let currentChunk = '';
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (currentChunk.length + line.length + 1 > maxChunkSize) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = '';
        }
      }
      currentChunk += line + '\n';
    }
    
    if (currentChunk.trim()) {
      chunks.push(currentChunk.trim());
    }
    
    return chunks;
  }

  // Function to process text content in chunks with retry logic
  async function processMPMPText(content: string) {
    const chunks = splitTextIntoChunks(content, 100000); // 100k characters per chunk
    let extractedData: any = {};
    
    for (let i = 0; i < chunks.length; i++) {
      console.log(`Processing chunk ${i + 1}/${chunks.length}`);
      
      let retries = 3;
      let chunkData: any = null;
      
      while (retries > 0 && !chunkData) {
        try {
          const response = await anthropic.messages.create({
            model: 'claude-3-7-sonnet-20250219', // the newest Anthropic model is "claude-3-7-sonnet-20250219" which was released February 24, 2025
            max_tokens: 4000,
            messages: [{
              role: 'user',
              content: `Você é um especialista em análise de documentos de marca pessoal. Analise o seguinte conteúdo (parte ${i + 1} de ${chunks.length}) e extraia informações estruturadas para criar um projeto no sistema BRIO.IA.

CONTEÚDO PARA ANÁLISE:
${chunks[i]}

${i === 0 ? `Responda APENAS com um objeto JSON válido contendo as seguintes chaves (use null para informações não encontradas nesta parte):

{
  "name": "Nome do projeto/marca pessoal",
  "purpose": "Propósito da marca",
  "originStory": "História de origem",
  "mission": "Missão",
  "archetype": "arquétipo da marca (heroi, cuidador, sabio, explorador, criador)",
  "superpowers": ["superpower1", "superpower2"],
  "vulnerabilities": ["vulnerability1", "vulnerability2"],
  "mainSpecialty": "Especialidade principal",
  "subspecialties": ["sub1", "sub2"],
  "targetAudienceDemografia": {"idade": "faixa etária", "genero": "todos/feminino/masculino", "localizacao": ["local1"], "poderAquisitivo": "A/B/C"},
  "targetAudiencePsicografia": {"dores": ["dor1"], "desejos": ["desejo1"], "objecoes": ["objecao1"], "gatilhos": ["gatilho1"]},
  "differentials": ["diferencial1", "diferencial2"],
  "methodology": "Metodologia de trabalho",
  "typicalResults": ["resultado1", "resultado2"],
  "guarantees": ["garantia1", "garantia2"],
  "toneOfVoice": {"formalidade": "casual/equilibrado/formal", "energia": "calma/moderada/energetica", "proximidade": "distante/profissional/amigavel/intimo"},
  "keywords": ["palavra1", "palavra2"],
  "avoidWords": ["evitar1", "evitar2"],
  "brandColors": ["#cor1", "#cor2"],
  "visualStyle": "minimalista/colorido/profissional/moderno",
  "mainHashtags": ["#hashtag1", "#hashtag2"],
  "postSignature": "Assinatura dos posts",
  "defaultBio": "Bio padrão para redes sociais"
}` : `Responda APENAS com um objeto JSON válido contendo informações ADICIONAIS encontradas nesta parte do documento. Use null para informações não encontradas. Mantenha a mesma estrutura do objeto anterior.`}

Seja preciso na extração e mantenha consistência com os dados do documento.`
            }]
          });

          const firstContent = response.content[0];
          if (firstContent.type !== 'text') {
            throw new Error('Resposta inesperada da API');
          }
          
          // Clean the response text to extract JSON
          let jsonText = firstContent.text.trim();
          
          // Remove markdown code blocks if present - more robust approach
          jsonText = jsonText.replace(/^```(?:json)?\s*/, '').replace(/\s*```\s*$/, '');
          
          // Find JSON object boundaries
          const openBrace = jsonText.indexOf('{');
          const closeBrace = jsonText.lastIndexOf('}');
          
          if (openBrace !== -1 && closeBrace !== -1 && closeBrace > openBrace) {
            jsonText = jsonText.substring(openBrace, closeBrace + 1);
          }
          
          chunkData = JSON.parse(jsonText);
          
        } catch (error: any) {
          retries--;
          if (error?.status === 529) {
            console.log(`API overloaded, retrying in ${(4 - retries) * 2} seconds...`);
            await new Promise(resolve => setTimeout(resolve, (4 - retries) * 2000));
          } else if (retries === 0) {
            throw error;
          }
        }
      }
      
      if (!chunkData) {
        throw new Error('Failed to process chunk after retries');
      }
      
      // Merge data from this chunk
      for (const key in chunkData) {
        if (chunkData[key] !== null && chunkData[key] !== undefined) {
          if (Array.isArray(chunkData[key])) {
            extractedData[key] = [...(extractedData[key] || []), ...chunkData[key]];
          } else if (typeof chunkData[key] === 'object' && chunkData[key] !== null) {
            extractedData[key] = { ...(extractedData[key] || {}), ...chunkData[key] };
          } else {
            extractedData[key] = chunkData[key];
          }
        }
      }
    }
    
    return extractedData;
  }

  // Process MPMP text route
  app.post("/api/projects/process-mpmp-text", async (req, res) => {
    try {
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Conteúdo de texto é obrigatório' });
      }

      console.log(`Processing MPMP text content: ${content.length} characters`);
      
      const result = await processMPMPText(content);
      
      const projectData = {
        name: result.name || 'Projeto MPMP',
        userId: 1, // hardcoded for now
        purpose: result.purpose,
        originStory: result.originStory,
        mission: result.mission,
        archetype: result.archetype,
        superpowers: result.superpowers,
        vulnerabilities: result.vulnerabilities,
        mainSpecialty: result.mainSpecialty,
        subspecialties: result.subspecialties,
        targetAudienceDemografia: result.targetAudienceDemografia,
        targetAudiencePsicografia: result.targetAudiencePsicografia,
        differentials: result.differentials,
        methodology: result.methodology,
        typicalResults: result.typicalResults,
        guarantees: result.guarantees,
        toneOfVoice: result.toneOfVoice,
        keywords: result.keywords,
        avoidWords: result.avoidWords,
        brandColors: result.brandColors,
        visualStyle: result.visualStyle,
        mainHashtags: result.mainHashtags,
        postSignature: result.postSignature,
        defaultBio: result.defaultBio,
        values: result // Store complete extracted data
      };

      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error('Error processing MPMP text:', error);
      res.status(500).json({ 
        error: 'Erro ao processar texto MPMP',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Upload MPMP route
  app.post('/api/projects/upload-mpmp', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Arquivo não encontrado' });
      }

      const extractedData = await processMPMPFile(req.file.path, req.file.originalname);
      
      // Create project with extracted data
      const projectData = {
        name: extractedData.name,
        userId: 1, // Default user
        purpose: extractedData.purpose,
        originStory: extractedData.originStory,
        mission: extractedData.mission,
        archetype: extractedData.archetype,
        superpowers: extractedData.superpowers,
        vulnerabilities: extractedData.vulnerabilities,
        mainSpecialty: extractedData.mainSpecialty,
        subspecialties: extractedData.subspecialties,
        targetAudience: extractedData.targetAudience,
        differentials: extractedData.differentials,
        methodology: extractedData.methodology,
        typicalResults: extractedData.typicalResults,
        guarantees: extractedData.guarantees,
        toneOfVoice: extractedData.toneOfVoice,
        keywords: extractedData.keywords,
        avoidWords: extractedData.avoidWords,
        brandColors: extractedData.brandColors,
        visualStyle: extractedData.visualStyle,
        mainHashtags: extractedData.mainHashtags,
        postSignature: extractedData.postSignature,
        defaultBio: extractedData.defaultBio,
        values: extractedData // Store complete extracted data
      };

      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error('Error processing MPMP:', error);
      res.status(500).json({ 
        error: 'Erro ao processar arquivo MPMP',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  app.post("/api/projects", async (req, res) => {
    try {
      const projectData = {
        ...req.body,
        userId: 1, // For now, using default user ID
      };
      
      const project = await storage.createProject(projectData);
      res.json(project);
    } catch (error) {
      console.error('Error creating project:', error);
      res.status(500).json({ message: "Erro ao criar projeto" });
    }
  });

  app.get("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.getProject(id);
      
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }
      
      res.json(project);
    } catch (error) {
      console.error('Error fetching project:', error);
      res.status(500).json({ message: "Erro ao buscar projeto" });
    }
  });

  app.put("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const project = await storage.updateProject(id, req.body);
      res.json(project);
    } catch (error) {
      console.error('Error updating project:', error);
      res.status(500).json({ message: "Erro ao atualizar projeto" });
    }
  });

  app.delete("/api/projects/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteProject(id);
      res.json({ message: "Projeto removido com sucesso" });
    } catch (error) {
      console.error('Error deleting project:', error);
      res.status(500).json({ message: "Erro ao remover projeto" });
    }
  });

  // Editorial Calendar endpoints
  app.post("/api/editorial-calendar", async (req, res) => {
    try {
      const { projectId, month, year } = req.body;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }

      const calendar = await generateEditorialCalendar(project, month, year);
      res.json(calendar);
    } catch (error) {
      console.error('Error generating editorial calendar:', error);
      res.status(500).json({ message: "Erro ao gerar calendário editorial" });
    }
  });

  app.post("/api/editorial-calendar/regenerate", async (req, res) => {
    try {
      const { projectId, date, objective, code } = req.body;
      
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ message: "Projeto não encontrado" });
      }

      const newSuggestion = await generateSingleSuggestion(project, date, objective, code);
      res.json(newSuggestion);
    } catch (error) {
      console.error('Error regenerating suggestion:', error);
      res.status(500).json({ message: "Erro ao regenerar sugestão" });
    }
  });

  // Quick calendar endpoint for testing without MPMP
  app.post("/api/editorial-calendar/quick", async (req, res) => {
    try {
      const { profession, objective, month, year } = req.body;
      
      // Create a mock project for quick testing
      const mockProject = {
        name: `Teste - ${profession}`,
        mainSpecialty: profession,
        purpose: objective,
        values: ['Qualidade', 'Profissionalismo', 'Resultados'],
        id: 0
      };

      const calendar = await generateEditorialCalendar(mockProject, month, year);
      res.json(calendar);
    } catch (error) {
      console.error('Error generating quick calendar:', error);
      res.status(500).json({ message: "Erro ao gerar calendário de teste" });
    }
  });

  // Success Stories endpoints
  app.get('/api/success-stories', async (req, res) => {
    try {
      const filters = {
        search: req.query.search as string,
        industry: req.query.industry as string,
        magneticCode: req.query.magneticCode as string,
        objective: req.query.objective as string,
        limit: req.query.limit ? parseInt(req.query.limit as string) : undefined
      };

      const stories = await storage.getSuccessStories(filters);
      res.json(stories);
    } catch (error) {
      console.error('Error fetching success stories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/success-stories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const story = await storage.getSuccessStory(id);
      
      if (!story) {
        return res.status(404).json({ error: 'Success story not found' });
      }
      
      res.json(story);
    } catch (error) {
      console.error('Error fetching success story:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // MPMP Import PDF endpoint
  app.post('/api/mpmp/import-pdf', async (req, res) => {
    try {
      // For now, simulate PDF processing and return structured data
      // In production, this would use a PDF parser + AI to extract information
      
      const mockExtractedData = {
        name: "Dr. Ana Silva - Nutricionista",
        purpose: "Transformar a relação das pessoas com a alimentação através de uma abordagem integrativa e humanizada",
        values: ["Saúde integral", "Educação nutricional", "Sustentabilidade", "Bem-estar"],
        originStory: "Após superar meus próprios desafios com alimentação, descobri que a nutrição vai muito além das calorias - é sobre criar uma relação saudável e sustentável com a comida.",
        mission: "Educar e empoderar pessoas para que façam escolhas alimentares conscientes e transformem sua saúde de dentro para fora",
        mainSpecialty: "Nutrição Clínica e Comportamental",
        subspecialties: ["Nutrição esportiva", "Transtornos alimentares", "Nutrição infantil"],
        differentials: ["Abordagem integrativa", "Foco no comportamento alimentar", "Acompanhamento personalizado"],
        methodology: "Método NUTRI+ - Nutrição + Comportamento + Sustentabilidade",
        typicalResults: ["Perda de peso sustentável", "Melhora dos exames laboratoriais", "Mudança de hábitos duradoura"],
        keywords: ["nutrição", "alimentação saudável", "mudança de hábitos", "saúde integral"],
        defaultBio: "Nutricionista Clínica | Especialista em Comportamento Alimentar | Transformando vidas através da alimentação consciente"
      };

      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      res.json({
        success: true,
        projectData: mockExtractedData,
        message: "PDF processado com sucesso"
      });

    } catch (error) {
      console.error('Error processing PDF:', error);
      res.status(500).json({ 
        success: false,
        message: "Erro ao processar PDF" 
      });
    }
  });

  // Stories API endpoints
  app.get('/api/stories', async (req, res) => {
    try {
      const { projectId, limit = 10 } = req.query;
      const stories = await storage.getStoryProjects(
        projectId ? parseInt(projectId as string) : undefined,
        parseInt(limit as string)
      );
      res.json(stories);
    } catch (error) {
      console.error('Error fetching stories:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/stories/generate', async (req, res) => {
    try {
      const { projectId, title, framework, objective, magneticCode } = req.body;

      // Get project MPMP data
      const project = await storage.getProject(projectId);
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }

      // Generate story slides using Claude
      const slides = await generateStorySlides({
        project,
        framework,
        objective,
        magneticCode,
        title
      });

      // Save story to storage
      const storyProject = await storage.createStoryProject({
        projectId,
        userId: 1, // Default user
        title,
        framework,
        objective,
        magneticCode,
        slides,
        metadata: {
          estimatedDuration: slides.length * 5, // 5 seconds per slide
          hashtags: project.mainHashtags || [],
          createdAt: new Date().toISOString()
        },
        status: 'draft'
      });

      res.json({
        id: storyProject.id,
        title: storyProject.title,
        slides: slides,
        framework: storyProject.framework,
        objective: storyProject.objective,
        magneticCode: storyProject.magneticCode
      });

    } catch (error) {
      console.error('Error generating story:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/stories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const story = await storage.getStoryProject(parseInt(id));
      if (!story) {
        return res.status(404).json({ error: 'Story not found' });
      }
      res.json(story);
    } catch (error) {
      console.error('Error fetching story:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.put('/api/stories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const story = await storage.updateStoryProject(parseInt(id), updateData);
      res.json(story);
    } catch (error) {
      console.error('Error updating story:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/stories/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteStoryProject(parseInt(id));
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting story:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
