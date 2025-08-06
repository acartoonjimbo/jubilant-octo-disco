import { type Category, type InsertCategory, type Player, type InsertPlayer, type Tag, type InsertTag, categories, players, tags } from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: string, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: string): Promise<boolean>;

  // Players
  getPlayers(): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: string, player: Partial<InsertPlayer>): Promise<Player | undefined>;
  deletePlayer(id: string): Promise<boolean>;

  // Tags
  getTags(): Promise<Tag[]>;
  getTag(id: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  updateTag(id: string, tag: Partial<InsertTag>): Promise<Tag | undefined>;
  deleteTag(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private categories: Map<string, Category>;
  private players: Map<string, Player>;
  private tags: Map<string, Tag>;

  constructor() {
    this.categories = new Map();
    this.players = new Map();
    this.tags = new Map();

    // Initialize with default categories
    this.initializeDefaults();
  }

  private initializeDefaults() {
    const defaultCategories = [
      { name: "Offensive Play" },
      { name: "Defensive Play" },
      { name: "Turnover" },
      { name: "Goal" },
      { name: "Penalty" },
    ];

    defaultCategories.forEach(cat => {
      const id = randomUUID();
      this.categories.set(id, { ...cat, id });
    });

    const defaultPlayers = [
      { name: "Sarah Johnson", number: 7 },
      { name: "Mike Chen", number: 23 },
      { name: "Alex Rivera", number: 12 },
      { name: "Taylor Kim", number: 5 },
      { name: "Jordan Smith", number: 18 },
      { name: "Casey Williams", number: 9 },
    ];

    defaultPlayers.forEach(player => {
      const id = randomUUID();
      this.players.set(id, { ...player, id });
    });
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;

    const updatedCategory = { ...category, ...updateData };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: string): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Players
  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const id = randomUUID();
    const player: Player = { ...insertPlayer, id };
    this.players.set(id, player);
    return player;
  }

  async updatePlayer(id: string, updateData: Partial<InsertPlayer>): Promise<Player | undefined> {
    const player = this.players.get(id);
    if (!player) return undefined;

    const updatedPlayer = { ...player, ...updateData };
    this.players.set(id, updatedPlayer);
    return updatedPlayer;
  }

  async deletePlayer(id: string): Promise<boolean> {
    return this.players.delete(id);
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    return Array.from(this.tags.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  async getTag(id: string): Promise<Tag | undefined> {
    return this.tags.get(id);
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const id = randomUUID();
    const tag: Tag = { 
      ...insertTag,
      playerIds: insertTag.playerIds || [],
      videoUrl: insertTag.videoUrl || null,
      id, 
      createdAt: new Date()
    };
    this.tags.set(id, tag);
    return tag;
  }

  async updateTag(id: string, updateData: Partial<InsertTag>): Promise<Tag | undefined> {
    const tag = this.tags.get(id);
    if (!tag) return undefined;

    const updatedTag = { ...tag, ...updateData };
    this.tags.set(id, updatedTag);
    return updatedTag;
  }

  async deleteTag(id: string): Promise<boolean> {
    return this.tags.delete(id);
  }
}

// Database Storage Implementation
export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaults();
  }

  private async initializeDefaults() {
    // Check if we already have data to avoid duplicates
    const existingCategories = await this.getCategories();
    if (existingCategories.length === 0) {
      const defaultCategories = [
        { name: "Offensive Play" },
        { name: "Defensive Play" },
        { name: "Turnover" },
        { name: "Goal" },
        { name: "Penalty" },
      ];

      for (const cat of defaultCategories) {
        await this.createCategory(cat);
      }
    }

    const existingPlayers = await this.getPlayers();
    if (existingPlayers.length === 0) {
      const defaultPlayers = [
        { name: "Sarah Johnson", number: 7 },
        { name: "Mike Chen", number: 23 },
        { name: "Alex Rivera", number: 12 },
        { name: "Taylor Kim", number: 5 },
        { name: "Jordan Smith", number: 18 },
        { name: "Casey Williams", number: 9 },
      ];

      for (const player of defaultPlayers) {
        await this.createPlayer(player);
      }
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: string, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [updatedCategory] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory || undefined;
  }

  async deleteCategory(id: string): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning();
    return result.length > 0;
  }

  // Players
  async getPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    return player;
  }

  async updatePlayer(id: string, updateData: Partial<InsertPlayer>): Promise<Player | undefined> {
    const [updatedPlayer] = await db
      .update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning();
    return updatedPlayer || undefined;
  }

  async deletePlayer(id: string): Promise<boolean> {
    const result = await db
      .delete(players)
      .where(eq(players.id, id))
      .returning();
    return result.length > 0;
  }

  // Tags
  async getTags(): Promise<Tag[]> {
    const allTags = await db.select().from(tags);
    return allTags.sort((a, b) => a.timestamp - b.timestamp);
  }

  async getTag(id: string): Promise<Tag | undefined> {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id));
    return tag || undefined;
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db
      .insert(tags)
      .values(insertTag)
      .returning();
    return tag;
  }

  async updateTag(id: string, updateData: Partial<InsertTag>): Promise<Tag | undefined> {
    const [updatedTag] = await db
      .update(tags)
      .set(updateData)
      .where(eq(tags.id, id))
      .returning();
    return updatedTag || undefined;
  }

  async deleteTag(id: string): Promise<boolean> {
    const result = await db
      .delete(tags)
      .where(eq(tags.id, id))
      .returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
