import { 
  users,
  contentGenerations,
  projects,
  type User,
  type UpsertUser,
  type ContentGeneration, 
  type InsertContentGeneration,
  type Project,
  type InsertProject,
  type SuccessStory,
  type HistoryItem,
  type StoryProject,
  type InsertStoryProject
} from "@shared/schema";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Projects
  createProject(project: InsertProject): Promise<Project>;
  getProjects(userId: string): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project>;
  deleteProject(id: number): Promise<void>;
  
  // Content Generations
  createContentGeneration(generation: InsertContentGeneration): Promise<ContentGeneration>;
  getContentGenerations(limit?: number, projectId?: number, userId?: string): Promise<ContentGeneration[]>;
  getHistoryItems(limit?: number, projectId?: number, userId?: string): Promise<HistoryItem[]>;
  
  // Success Stories
  getSuccessStories(filters?: {
    search?: string;
    industry?: string;
    magneticCode?: string;
    objective?: string;
    limit?: number;
  }): Promise<SuccessStory[]>;
  getSuccessStory(id: number): Promise<SuccessStory | undefined>;
  
  // Story Projects
  createStoryProject(story: InsertStoryProject): Promise<StoryProject>;
  getStoryProjects(projectId?: number, limit?: number): Promise<StoryProject[]>;
  getStoryProject(id: number): Promise<StoryProject | undefined>;
  updateStoryProject(id: number, story: Partial<InsertStoryProject>): Promise<StoryProject>;
  deleteStoryProject(id: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private contentGenerations: Map<number, ContentGeneration>;
  private projects: Map<number, Project>;
  private successStories: Map<number, SuccessStory>;
  private storyProjects: Map<number, StoryProject>;
  private currentContentId: number;
  private currentProjectId: number;
  private currentStoryId: number;
  private currentStoryProjectId: number;

  constructor() {
    this.users = new Map();
    this.contentGenerations = new Map();
    this.projects = new Map();
    this.successStories = new Map();
    this.storyProjects = new Map();
    this.currentContentId = 1;
    this.currentProjectId = 1;
    this.currentStoryId = 1;
    this.currentStoryProjectId = 1;
    
    this.initializeSampleStories();
  }

  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const now = new Date();
    const existingUser = this.users.get(userData.id);
    
    const user: User = {
      ...userData,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
    };
    
    this.users.set(userData.id, user);
    return user;
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

  async getProjects(userId: string): Promise<Project[]> {
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

  // Success Stories methods
  private initializeSampleStories() {
    const sampleStories: SuccessStory[] = [
      {
        id: 1,
        title: "Estratégia de conteúdo que triplicou engajamento em consultoria",
        description: "Case real de como usar o código 'Confirmação de Suspeitas' aumentou significativamente a interação.",
        content: "Muitos consultores fazem o mesmo erro: focam em vender sem confirmar o que o cliente já suspeita. Quando comecei a usar essa abordagem nos meus posts, tudo mudou...",
        magneticCode: "Confirmação de Suspeitas",
        objective: "convencer",
        industry: "consultoria",
        author: "Mariana Silva",
        authorRole: "Consultora de Marketing Digital",
        authorInstagram: "mariana_marketing",
        metrics: {
          likes: 2400,
          comments: 156,
          shares: 78,
          reach: 18500,
          engagement_rate: 14.2
        },
        tags: ["consultoria", "marketing", "engajamento"],
        isFeatured: true,
        imageUrl: null,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15')
      },
      {
        id: 2,
        title: "História pessoal que conectou com 50mil seguidores",
        description: "Como compartilhar vulnerabilidade de forma estratégica gerou conexão profunda com a audiência.",
        content: "Nunca pensei que contar sobre minha síndrome do impostor ia gerar tanto engajamento. Mas quando você se mostra humano, as pessoas se identificam...",
        magneticCode: "História Pessoal",
        objective: "conectar",
        industry: "educacao",
        author: "Prof. Carlos Mendes",
        authorRole: "Educador e Coach",
        authorInstagram: "prof_carlosmendes",
        metrics: {
          likes: 1800,
          comments: 234,
          shares: 145,
          reach: 25000,
          engagement_rate: 8.7
        },
        tags: ["educação", "coaching", "desenvolvimento"],
        isFeatured: true,
        imageUrl: null,
        createdAt: new Date('2024-01-14'),
        updatedAt: new Date('2024-01-14')
      }
    ];

    sampleStories.forEach(story => {
      this.successStories.set(story.id, story);
      if (story.id >= this.currentStoryId) {
        this.currentStoryId = story.id + 1;
      }
    });
  }

  async getSuccessStories(filters?: {
    search?: string;
    industry?: string;
    magneticCode?: string;
    objective?: string;
    limit?: number;
  }): Promise<SuccessStory[]> {
    let stories = Array.from(this.successStories.values());

    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      stories = stories.filter(story =>
        story.title.toLowerCase().includes(searchTerm) ||
        story.description.toLowerCase().includes(searchTerm) ||
        story.content.toLowerCase().includes(searchTerm) ||
        story.author.toLowerCase().includes(searchTerm)
      );
    }

    if (filters?.industry) {
      stories = stories.filter(story => story.industry === filters.industry);
    }

    if (filters?.magneticCode) {
      stories = stories.filter(story => story.magneticCode === filters.magneticCode);
    }

    if (filters?.objective) {
      stories = stories.filter(story => story.objective === filters.objective);
    }

    stories.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (filters?.limit) {
      stories = stories.slice(0, filters.limit);
    }

    return stories;
  }

  async getSuccessStory(id: number): Promise<SuccessStory | undefined> {
    return this.successStories.get(id);
  }

  // Story Projects methods
  async createStoryProject(insertStoryProject: InsertStoryProject): Promise<StoryProject> {
    const id = this.currentStoryProjectId++;
    const storyProject: StoryProject = {
      id,
      ...insertStoryProject,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.storyProjects.set(id, storyProject);
    return storyProject;
  }

  async getStoryProjects(projectId?: number, limit: number = 10): Promise<StoryProject[]> {
    const allStories = Array.from(this.storyProjects.values());
    const filtered = projectId 
      ? allStories.filter(story => story.projectId === projectId)
      : allStories;
    
    return filtered
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
  }

  async getStoryProject(id: number): Promise<StoryProject | undefined> {
    return this.storyProjects.get(id);
  }

  async updateStoryProject(id: number, updateData: Partial<InsertStoryProject>): Promise<StoryProject> {
    const existing = this.storyProjects.get(id);
    if (!existing) {
      throw new Error('Story project not found');
    }
    
    const updated: StoryProject = {
      ...existing,
      ...updateData,
      id,
      updatedAt: new Date(),
    };
    
    this.storyProjects.set(id, updated);
    return updated;
  }

  async deleteStoryProject(id: number): Promise<void> {
    this.storyProjects.delete(id);
  }
}

export const storage = new MemStorage();
