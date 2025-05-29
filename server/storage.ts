import { 
  contentGenerations,
  projects,
  type ContentGeneration, 
  type InsertContentGeneration,
  type Project,
  type InsertProject,
  type SuccessStory,
  type HistoryItem 
} from "@shared/schema";

export interface IStorage {
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProjects(userId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Content Generations
  createContentGeneration(generation: InsertContentGeneration): Promise<ContentGeneration>;
  getContentGenerations(limit?: number, projectId?: number): Promise<ContentGeneration[]>;
  getHistoryItems(limit?: number, projectId?: number): Promise<HistoryItem[]>;
  
  // Success Stories
  getSuccessStories(filters?: {
    search?: string;
    industry?: string;
    magneticCode?: string;
    objective?: string;
    limit?: number;
  }): Promise<SuccessStory[]>;
  getSuccessStory(id: number): Promise<SuccessStory | undefined>;
}

export class MemStorage implements IStorage {
  private contentGenerations: Map<number, ContentGeneration>;
  private projects: Map<number, Project>;
  private successStories: Map<number, SuccessStory>;
  private currentContentId: number;
  private currentProjectId: number;
  private currentStoryId: number;

  constructor() {
    this.contentGenerations = new Map();
    this.projects = new Map();
    this.successStories = new Map();
    this.currentContentId = 1;
    this.currentProjectId = 1;
    this.currentStoryId = 1;
    
    this.initializeSampleStories();
  }

  // Projects methods
  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = this.currentProjectId++;
    const project: Project = {
      id,
      ...insertProject,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.projects.set(id, project);
    return project;
  }

  async getProjects(userId: number): Promise<Project[]> {
    return Array.from(this.projects.values())
      .filter(project => project.userId === userId)
      .sort((a, b) => (b.updatedAt?.getTime() || 0) - (a.updatedAt?.getTime() || 0));
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async updateProject(id: number, updateData: Partial<InsertProject>): Promise<Project> {
    const existingProject = this.projects.get(id);
    if (!existingProject) {
      throw new Error('Project not found');
    }

    const updatedProject: Project = {
      ...existingProject,
      ...updateData,
      updatedAt: new Date(),
    };

    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<void> {
    this.projects.delete(id);
    // Also remove associated content generations
    const generationsToDelete = Array.from(this.contentGenerations.entries())
      .filter(([_, generation]) => generation.projectId === id)
      .map(([genId, _]) => genId);
    
    generationsToDelete.forEach(genId => {
      this.contentGenerations.delete(genId);
    });
  }

  async createContentGeneration(insertGeneration: InsertContentGeneration): Promise<ContentGeneration> {
    const id = this.currentContentId++;
    const generation: ContentGeneration = {
      id,
      userId: insertGeneration.userId,
      projectId: insertGeneration.projectId || null,
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

  async getContentGenerations(limit: number = 10, projectId?: number): Promise<ContentGeneration[]> {
    const generations = Array.from(this.contentGenerations.values())
      .filter(gen => projectId ? gen.projectId === projectId : true)
      .sort((a, b) => {
        const aTime = a.createdAt?.getTime() || 0;
        const bTime = b.createdAt?.getTime() || 0;
        return bTime - aTime;
      })
      .slice(0, limit);
    
    return generations;
  }

  async getHistoryItems(limit: number = 10, projectId?: number): Promise<HistoryItem[]> {
    const generations = await this.getContentGenerations(limit, projectId);
    
    return generations.map(gen => {
      const project = gen.projectId ? this.projects.get(gen.projectId) : null;
      return {
        id: gen.id,
        topic: gen.topic,
        codes: gen.codesUsed as string[],
        timestamp: gen.createdAt?.toISOString() || new Date().toISOString(),
        objective: gen.objective || undefined,
        projectName: project?.name,
      };
    });
  }
}

export const storage = new MemStorage();
