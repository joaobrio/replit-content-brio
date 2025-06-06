import { pgTable, text, serial, integer, boolean, timestamp, json, varchar, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: json("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(), // Replit user ID (string)
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  
  // MPMP - Manual de Posicionamento de Marca Pessoal
  // Essência - Quem é
  purpose: text("purpose"), // Por que você faz o que faz
  values: json("values"), // Array de valores core
  originStory: text("origin_story"), // A história que define você
  mission: text("mission"), // O que você quer transformar
  archetype: text("archetype"), // heroi|cuidador|sabio|explorador|criador
  superpowers: json("superpowers"), // Array de habilidades únicas
  vulnerabilities: json("vulnerabilities"), // O que te torna humano
  
  // Execução - O que entrega
  mainSpecialty: text("main_specialty"),
  subspecialties: json("subspecialties"), // Array
  targetAudience: json("target_audience"), // Objeto com demografia e psicografia
  differentials: json("differentials"), // Array - O que você faz diferente
  methodology: text("methodology"), // Seu método único
  typicalResults: json("typical_results"), // Array - Cases e números
  guarantees: json("guarantees"), // Array - O que você promete
  
  // Expressão - Como comunica
  toneOfVoice: json("tone_of_voice"), // Objeto com formalidade, energia, proximidade
  keywords: json("keywords"), // Array - Termos que sempre usa
  avoidWords: json("avoid_words"), // Array - Termos que nunca usa
  brandColors: json("brand_colors"), // Array - Hex colors
  visualStyle: text("visual_style"), // minimalista|colorido|profissional|moderno
  mainHashtags: json("main_hashtags"), // Array
  postSignature: text("post_signature"), // Como termina posts
  defaultBio: text("default_bio"), // Bio para redes sociais
  
  // Configurações de IA
  preferredModel: text("preferred_model").default("claude-3-7-sonnet"),
  creativity: integer("creativity").default(70), // 0-100 (conservador-criativo)
  favoritesCodes: json("favorites_codes"), // Array - Quais dos 8 usa mais
  avoidCodes: json("avoid_codes"), // Array - Quais evitar
  autoHashtags: boolean("auto_hashtags").default(true),
  autoEmojis: boolean("auto_emojis").default(false),
  autoCta: boolean("auto_cta").default(true),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contentGenerations = pgTable("content_generations", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  topic: text("topic").notNull(),
  objective: text("objective"), // captar, conectar, convencer, converter
  variations: json("variations").notNull(), // Array of generated content variations
  codesUsed: json("codes_used").notNull(), // Array of magnetic codes used
  tokensUsed: integer("tokens_used").default(0),
  generationTime: integer("generation_time").default(0), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const successStories = pgTable("success_stories", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  magneticCode: text("magnetic_code").notNull(),
  objective: text("objective").notNull(),
  industry: text("industry").notNull(),
  author: text("author").notNull(),
  authorRole: text("author_role").notNull(),
  authorInstagram: text("author_instagram"),
  metrics: json("metrics"), // likes, comments, shares, reach, engagement_rate
  tags: json("tags").default([]),
  isFeatured: boolean("is_featured").default(false),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storyProjects = pgTable("story_projects", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").references(() => projects.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  framework: text("framework").notNull(), // '5R', 'VLOG', 'TRANSFORMATION', 'CONTRAPOPULAR', 'RITUAL'
  objective: text("objective").notNull(), // 'CAPTAR', 'CONECTAR', 'CONVENCER', 'CONVERTER'
  magneticCode: text("magnetic_code").notNull(),
  slides: json("slides").notNull(), // Array of StorySlide objects
  metadata: json("metadata"), // estimatedDuration, hashtags, etc.
  status: text("status").default("draft"), // 'draft', 'published', 'archived'
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const storyAnalytics = pgTable("story_analytics", {
  id: serial("id").primaryKey(),
  storyProjectId: integer("story_project_id").references(() => storyProjects.id).notNull(),
  views: integer("views").default(0),
  completionRate: integer("completion_rate").default(0), // percentage
  exitPoints: json("exit_points"), // Array of {slideIndex, count}
  interactions: json("interactions"), // polls, questions, linkClicks, etc.
  shareRate: integer("share_rate").default(0),
  saveRate: integer("save_rate").default(0),
  recordedAt: timestamp("recorded_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertContentGenerationSchema = createInsertSchema(contentGenerations).omit({
  id: true,
  createdAt: true,
});

export const insertSuccessStorySchema = createInsertSchema(successStories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStoryProjectSchema = createInsertSchema(storyProjects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStoryAnalyticsSchema = createInsertSchema(storyAnalytics).omit({
  id: true,
  recordedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type ContentGeneration = typeof contentGenerations.$inferSelect;
export type InsertContentGeneration = z.infer<typeof insertContentGenerationSchema>;
export type SuccessStory = typeof successStories.$inferSelect;
export type InsertSuccessStory = z.infer<typeof insertSuccessStorySchema>;
export type StoryProject = typeof storyProjects.$inferSelect;
export type InsertStoryProject = z.infer<typeof insertStoryProjectSchema>;
export type StoryAnalytics = typeof storyAnalytics.$inferSelect;
export type InsertStoryAnalytics = z.infer<typeof insertStoryAnalyticsSchema>;

// Frontend-specific types
export interface ContentVariation {
  id: string;
  code: string;
  content: string;
  wordCount: number;
  tone: string;
}

export interface GenerationRequest {
  topic: string;
  objective?: string;
}

export interface GenerationResponse {
  id: number;
  topic: string;
  objective?: string;
  variations: ContentVariation[];
  codesUsed: string[];
  tokensUsed: number;
  generationTime: number;
  timestamp: string;
}

export interface HistoryItem {
  id: number;
  topic: string;
  codes: string[];
  timestamp: string;
  objective?: string;
  projectName?: string;
}

// MPMP Types
export interface MPMPEssencia {
  purpose: string;
  values: string[];
  originStory: string;
  mission: string;
  archetype: 'heroi' | 'cuidador' | 'sabio' | 'explorador' | 'criador';
  superpowers: string[];
  vulnerabilities: string[];
}

export interface MPMPExecucao {
  mainSpecialty: string;
  subspecialties: string[];
  targetAudience: {
    demografia: {
      idade: string;
      genero: 'todos' | 'feminino' | 'masculino';
      localizacao: string[];
      poderAquisitivo: 'A' | 'B' | 'C';
    };
    psicografia: {
      dores: string[];
      desejos: string[];
      objecoes: string[];
      gatilhos: string[];
    };
  };
  differentials: string[];
  methodology: string;
  typicalResults: string[];
  guarantees: string[];
}

export interface MPMPExpressao {
  toneOfVoice: {
    formalidade: 'casual' | 'equilibrado' | 'formal';
    energia: 'calma' | 'moderada' | 'energetica';
    proximidade: 'distante' | 'profissional' | 'amigavel' | 'intimo';
  };
  keywords: string[];
  avoidWords: string[];
  brandColors: string[];
  visualStyle: 'minimalista' | 'colorido' | 'profissional' | 'moderno';
  mainHashtags: string[];
  postSignature: string;
  defaultBio: string;
}

// Story-specific types
export interface StorySlide {
  id: string;
  order: number;
  type: 'text' | 'image' | 'video' | 'mixed';
  content: {
    headline?: string;
    body?: string;
    backgroundType: 'solid' | 'gradient' | 'image';
    backgroundColor?: string;
    textColor?: string;
    duration: number; // seconds
    elements?: StoryElement[];
  };
}

export interface StoryElement {
  type: 'emoji' | 'sticker' | 'poll' | 'question' | 'countdown';
  position: { x: number; y: number };
  data: any;
}

export interface StoryFramework {
  id: string;
  name: string;
  description: string;
  slideCount: number;
  structure: string[];
  bestFor: string[];
  examples: string[];
}

export interface StorySequence {
  id: string;
  name: string;
  description: string;
  duration: string; // "semana", "mes", etc.
  stories: {
    day: string;
    framework: string;
    objective: string;
    magneticCode: string;
  }[];
}
