import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const categories = pgTable("categories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
});

export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  number: integer("number").notNull(),
});

export const tags = pgTable("tags", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  timestamp: integer("timestamp").notNull(), // in seconds
  categoryId: varchar("category_id").notNull().references(() => categories.id),
  description: text("description").notNull(),
  playerIds: text("player_ids").array().notNull().default([]), // array of player IDs
  videoUrl: text("video_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  number: true,
});

export const insertTagSchema = createInsertSchema(tags).pick({
  timestamp: true,
  categoryId: true,
  description: true,
  playerIds: true,
  videoUrl: true,
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Player = typeof players.$inferSelect;

export type InsertTag = z.infer<typeof insertTagSchema>;
export type Tag = typeof tags.$inferSelect;
