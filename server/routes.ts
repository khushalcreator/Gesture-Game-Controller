import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up authentication routes /api/login, /api/register, /api/logout
  await setupAuth(app);

  // === Game Profiles ===
  app.get(api.profiles.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const profiles = await storage.getGameProfiles(req.user!.id);
    res.json(profiles);
  });

  app.post(api.profiles.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.profiles.create.input.parse(req.body);
      const profile = await storage.createGameProfile({
        ...input,
        userId: req.user!.id,
      });
      res.status(201).json(profile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.profiles.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const profile = await storage.getGameProfile(Number(req.params.id));
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.userId !== req.user!.id) return res.sendStatus(403);
    res.json(profile);
  });

  app.put(api.profiles.update.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const profile = await storage.getGameProfile(Number(req.params.id));
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.userId !== req.user!.id) return res.sendStatus(403);

    try {
      const input = api.profiles.update.input.parse(req.body);
      const updated = await storage.updateGameProfile(Number(req.params.id), input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.profiles.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const profile = await storage.getGameProfile(Number(req.params.id));
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    if (profile.userId !== req.user!.id) return res.sendStatus(403);

    await storage.deleteGameProfile(Number(req.params.id));
    res.sendStatus(204);
  });

  // === Custom Gestures ===
  app.get(api.gestures.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const gestures = await storage.getCustomGestures(req.user!.id);
    res.json(gestures);
  });

  app.post(api.gestures.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    try {
      const input = api.gestures.create.input.parse(req.body);
      const gesture = await storage.createCustomGesture({
        ...input,
        userId: req.user!.id,
      });
      res.status(201).json(gesture);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.delete(api.gestures.delete.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const gestures = await storage.getCustomGestures(req.user!.id);
    const gesture = gestures.find(g => g.id === Number(req.params.id));
    if (!gesture) return res.status(404).json({ message: "Gesture not found" });

    await storage.deleteCustomGesture(Number(req.params.id));
    res.sendStatus(204);
  });

  // Seed Data Endpoint (Private/Internal or run on start if needed)
  // For simplicity, we'll check and seed on a special debug endpoint or let the user create one.
  // Actually, let's just expose a seed endpoint for the demo.
  app.post("/api/seed", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    // Check if user already has profiles
    const profiles = await storage.getGameProfiles(req.user!.id);
    if (profiles.length === 0) {
      await storage.createGameProfile({
        userId: req.user!.id,
        name: "Minecraft",
        description: "Standard controls for Minecraft",
        keyMappings: {
          "Fist": "W",
          "Open_Palm": "Space",
          "Pointing_Up": "Click"
        },
        settings: { sensitivity: 1.0, smoothFactor: 0.5 },
        isActive: true
      });
      await storage.createGameProfile({
        userId: req.user!.id,
        name: "Clash Royale",
        description: "Touch emulation for card deployment",
        keyMappings: {
          "Pointing_Up": "Tap",
          "Open_Palm": "Scroll",
          "Fist": "Select"
        },
        settings: { sensitivity: 1.2, smoothFactor: 0.7 },
        isActive: true
      });
      res.json({ message: "Seeded successfully" });
    } else {
      res.json({ message: "Already seeded" });
    }
  });

  return httpServer;
}
