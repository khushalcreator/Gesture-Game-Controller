import { pgTable, text, serial, integer, boolean, jsonb, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";

export * from "./models/auth";

// === TABLE DEFINITIONS ===
// Users table is imported from ./models/auth to ensure compatibility with Replit Auth

export const gameProfiles = pgTable("game_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  keyMappings: jsonb("key_mappings").$type<Record<string, string>>().notNull(),
  settings: jsonb("settings").$type<{ sensitivity: number; smoothFactor: number }>().default({ sensitivity: 1, smoothFactor: 0.5 }),
  isActive: boolean("is_active").default(true),
});

export const customGestures = pgTable("custom_gestures", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  data: jsonb("data").notNull(), 
});

// === BASE SCHEMAS ===
// Note: InsertUser is already defined in models/auth
export const insertGameProfileSchema = createInsertSchema(gameProfiles).omit({ id: true });
export const insertCustomGestureSchema = createInsertSchema(customGestures).omit({ id: true });

// === TYPES ===
// User types are exported from models/auth

export type GameProfile = typeof gameProfiles.$inferSelect;
export type InsertGameProfile = z.infer<typeof insertGameProfileSchema>;

export type CustomGesture = typeof customGestures.$inferSelect;
export type InsertCustomGesture = z.infer<typeof insertCustomGestureSchema>;
