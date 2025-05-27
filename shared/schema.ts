import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const contentGenerations = pgTable("content_generations", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  objective: text("objective"), // captar, conectar, convencer, converter
  variations: json("variations").notNull(), // Array of generated content variations
  codesUsed: json("codes_used").notNull(), // Array of magnetic codes used
  tokensUsed: integer("tokens_used").default(0),
  generationTime: integer("generation_time").default(0), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertContentGenerationSchema = createInsertSchema(contentGenerations).omit({
  id: true,
  createdAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ContentGeneration = typeof contentGenerations.$inferSelect;
export type InsertContentGeneration = z.infer<typeof insertContentGenerationSchema>;

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
}
