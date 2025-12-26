import { db } from "./db";
import {
  users, gameProfiles, customGestures,
  type User, type InsertUser,
  type GameProfile, type InsertGameProfile,
  type CustomGesture, type InsertCustomGesture
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Game Profile methods
  getGameProfiles(userId: string): Promise<GameProfile[]>;
  getGameProfile(id: number): Promise<GameProfile | undefined>;
  createGameProfile(profile: InsertGameProfile & { userId: string }): Promise<GameProfile>;
  updateGameProfile(id: number, updates: Partial<InsertGameProfile>): Promise<GameProfile>;
  deleteGameProfile(id: number): Promise<void>;

  // Custom Gesture methods
  getCustomGestures(userId: string): Promise<CustomGesture[]>;
  createCustomGesture(gesture: InsertCustomGesture & { userId: string }): Promise<CustomGesture>;
  deleteCustomGesture(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Note: The auth model uses 'email' not 'username', but we keep this for interface compatibility if needed
    // or we can remove it. For now, we'll just search by email if that's what's intended, 
    // but the schema says 'email'. 
    // Since this method isn't strictly used by the routes (we use ID), we can implement it as:
    const [user] = await db.select().from(users).where(eq(users.email, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getGameProfiles(userId: string): Promise<GameProfile[]> {
    return await db.select().from(gameProfiles).where(eq(gameProfiles.userId, userId));
  }

  async getGameProfile(id: number): Promise<GameProfile | undefined> {
    const [profile] = await db.select().from(gameProfiles).where(eq(gameProfiles.id, id));
    return profile;
  }

  async createGameProfile(profile: InsertGameProfile & { userId: string }): Promise<GameProfile> {
    const [newProfile] = await db.insert(gameProfiles).values(profile).returning();
    return newProfile;
  }

  async updateGameProfile(id: number, updates: Partial<InsertGameProfile>): Promise<GameProfile> {
    const [updated] = await db.update(gameProfiles)
      .set(updates)
      .where(eq(gameProfiles.id, id))
      .returning();
    return updated;
  }

  async deleteGameProfile(id: number): Promise<void> {
    await db.delete(gameProfiles).where(eq(gameProfiles.id, id));
  }

  async getCustomGestures(userId: string): Promise<CustomGesture[]> {
    return await db.select().from(customGestures).where(eq(customGestures.userId, userId));
  }

  async createCustomGesture(gesture: InsertCustomGesture & { userId: string }): Promise<CustomGesture> {
    const [newGesture] = await db.insert(customGestures).values(gesture).returning();
    return newGesture;
  }

  async deleteCustomGesture(id: number): Promise<void> {
    await db.delete(customGestures).where(eq(customGestures.id, id));
  }
}

export const storage = new DatabaseStorage();
