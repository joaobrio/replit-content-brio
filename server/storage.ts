import { 
  contentGenerations, 
  type ContentGeneration, 
  type InsertContentGeneration,
  type HistoryItem 
} from "@shared/schema";

export interface IStorage {
  createContentGeneration(generation: InsertContentGeneration): Promise<ContentGeneration>;
  getContentGenerations(limit?: number): Promise<ContentGeneration[]>;
  getHistoryItems(limit?: number): Promise<HistoryItem[]>;
}

export class MemStorage implements IStorage {
  private contentGenerations: Map<number, ContentGeneration>;
  private currentId: number;

  constructor() {
    this.contentGenerations = new Map();
    this.currentId = 1;
  }

  async createContentGeneration(insertGeneration: InsertContentGeneration): Promise<ContentGeneration> {
    const id = this.currentId++;
    const generation: ContentGeneration = {
      id,
      topic: insertGeneration.topic,
      objective: insertGeneration.objective || null,
      variations: insertGeneration.variations,
      codesUsed: insertGeneration.codesUsed,
      tokensUsed: insertGeneration.tokensUsed || 0,
      generationTime: insertGeneration.generationTime || 0,
      createdAt: new Date(),
    };
    
    this.contentGenerations.set(id, generation);
    return generation;
  }

  async getContentGenerations(limit: number = 10): Promise<ContentGeneration[]> {
    const generations = Array.from(this.contentGenerations.values())
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, limit);
    
    return generations;
  }

  async getHistoryItems(limit: number = 10): Promise<HistoryItem[]> {
    const generations = await this.getContentGenerations(limit);
    
    return generations.map(gen => ({
      id: gen.id,
      topic: gen.topic,
      codes: gen.codesUsed as string[],
      timestamp: gen.createdAt?.toISOString() || new Date().toISOString(),
      objective: gen.objective || undefined,
    }));
  }
}

export const storage = new MemStorage();
