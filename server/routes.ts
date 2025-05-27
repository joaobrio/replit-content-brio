import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContentGenerationSchema, type GenerationRequest, type GenerationResponse, type ContentVariation } from "@shared/schema";
import { z } from "zod";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || "default_key",
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

// Generate content using OpenAI GPT-4o
async function generateContentWithOpenAI(topic: string, code: string, objective: string): Promise<ContentVariation> {
  const codeInfo = MAGNETIC_CODES[code as keyof typeof MAGNETIC_CODES];
  
  const systemPrompt = `Você é o Agente BRIO.IA, especialista em criar conteúdo magnético para profissionais de saúde.

Você deve criar conteúdo sobre "${topic}" usando o código magnético "${code}".

OBJETIVO: ${objective}

ESTRUTURA DO CÓDIGO "${code}": ${codeInfo.structure}

INSTRUÇÕES:
1. Crie um texto de 100-200 palavras em português brasileiro
2. Use linguagem profissional mas acessível
3. Aplique rigorosamente a estrutura do código magnético
4. Mantenha o foco em saúde e medicina
5. Inclua um CTA sutil se apropriado
6. Use tom ${objective === 'captar' ? 'curioso e intrigante' : objective === 'conectar' ? 'empático e pessoal' : objective === 'convencer' ? 'autoritativo e baseado em evidências' : 'persuasivo e orientado à ação'}

Responda APENAS com o conteúdo, sem explicações adicionais.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: `Crie conteúdo sobre: ${topic}`
        }
      ]
    });

    const content = response.choices[0].message.content || '';
    const wordCount = content.split(' ').length;
    
    return {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      code,
      content,
      wordCount,
      tone: getToneForObjective(objective)
    };
  } catch (error) {
    console.error('Error generating content with OpenAI:', error);
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

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate content endpoint
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
      
      // Generate content for each code
      const variations: ContentVariation[] = [];
      let totalTokens = 0;

      for (const code of selectedCodes) {
        try {
          const variation = await generateContentWithOpenAI(topic, code, objective);
          variations.push(variation);
          totalTokens += 300; // Estimate tokens used
        } catch (error) {
          console.error(`Error generating content for code ${code}:`, error);
          // Continue with other codes even if one fails
        }
      }

      if (variations.length === 0) {
        return res.status(500).json({ 
          message: "Não foi possível gerar nenhuma variação de conteúdo. Verifique a configuração da API." 
        });
      }

      const generationTime = Date.now() - startTime;

      // Save to storage
      const contentGeneration = await storage.createContentGeneration({
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

  // Get history endpoint
  app.get("/api/history", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const history = await storage.getHistoryItems(limit);
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

  const httpServer = createServer(app);
  return httpServer;
}
