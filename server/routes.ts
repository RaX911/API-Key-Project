import type { Express } from "express";
import type { Server } from "http";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup Authentication
  await setupAuth(app);
  registerAuthRoutes(app);

  // === API KEYS ===
  app.get(api.keys.list.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const keys = await storage.getApiKeys();
    res.json(keys);
  });

  app.post(api.keys.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.keys.create.input.parse(req.body);
      const key = await storage.createApiKey(input);
      res.status(201).json(key);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  app.patch(api.keys.revoke.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const key = await storage.revokeApiKey(Number(req.params.id));
    if (!key) return res.status(404).json({ message: "Key not found" });
    res.json(key);
  });

  // === BTS ===
  app.get(api.bts.list.path, async (req, res) => {
    // Protected endpoint (either Auth user or Valid API Key)
    // For MVP dashboard, we rely on session auth. API Key logic would go here middleware-style.
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    const result = await storage.getBtsTowers({
      search: req.query.search as string,
      operator: req.query.operator as string,
      limit,
      offset
    });
    
    res.json({
      items: result.items,
      total: result.total,
      page,
      totalPages: Math.ceil(result.total / limit)
    });
  });

  app.post(api.bts.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    try {
      const input = api.bts.create.input.parse(req.body);
      const tower = await storage.createBtsTower(input);
      res.status(201).json(tower);
    } catch (err) {
      if (err instanceof z.ZodError) {
        res.status(400).json({ message: err.errors[0].message });
      } else {
        res.status(500).json({ message: "Internal Server Error" });
      }
    }
  });

  // === MSISDN LOOKUP ===
  app.get(api.msisdn.lookup.path, async (req, res) => {
    // This is the core "No Simulation" endpoint. 
    // It queries the DB for real records.
    
    // Check Auth OR API Key
    let authorized = req.isAuthenticated();
    if (!authorized && req.headers['x-api-key']) {
      const key = await storage.getApiKey(req.headers['x-api-key'] as string);
      if (key && key.status === 'active') {
        authorized = true;
        await storage.incrementApiKeyUsage(key.id);
      }
    }

    if (!authorized) return res.status(401).json({ message: "Unauthorized: Login or Valid API Key required" });

    const msisdn = req.query.msisdn as string;
    const result = await storage.lookupMsisdnDetails(msisdn);
    
    if (!result) return res.status(404).json({ message: "MSISDN not found in database" });
    res.json(result);
  });
  
  // === STATS ===
  app.get(api.stats.dashboard.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.status(401).json({ message: "Unauthorized" });
    const stats = await storage.getStats();
    res.json(stats);
  });

  // Seed Data on Startup
  seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const stats = await storage.getStats();
  if (stats.regionsCovered === 0) {
    console.log("Seeding database with Indonesian data...");
    
    // 1. Create Islands
    const java = await storage.createIsland({ name: "Java", code: "JAVA", lat: -7.6145, long: 110.7122 });
    const sumatra = await storage.createIsland({ name: "Sumatra", code: "SUMATRA", lat: -0.5897, long: 101.3431 });

    // 2. Create Provinces
    const jakarta = await storage.createProvince({ name: "DKI Jakarta", islandId: java.id, capital: "Jakarta" });
    const westJava = await storage.createProvince({ name: "West Java", islandId: java.id, capital: "Bandung" });

    // 3. Create a BTS Tower (Monas)
    const tower = await storage.createBtsTower({
      cellId: "CID-12345",
      lac: "LAC-777",
      mcc: "510", // Indonesia
      mnc: "10",  // Telkomsel
      lat: -6.1754,
      long: 106.8272,
      address: "Gambir, Central Jakarta City, Jakarta",
      operator: "Telkomsel",
      networkType: "5G",
      height: 132,
      coverageRadius: 5000
    });

    // 4. Create MSISDNs
    await storage.createMsisdn({
      msisdn: "628120000001",
      imsi: "510101234567890",
      imei: "358921000000001",
      provider: "Telkomsel",
      status: "active",
      registeredName: "Budi Santoso",
      lastBtsId: tower.id
    });
    
    await storage.createMsisdn({
      msisdn: "628120000002",
      imsi: "510109876543210",
      imei: "358921000000002",
      provider: "Telkomsel",
      status: "active",
      registeredName: "Siti Aminah",
      lastBtsId: tower.id
    });

    // 5. Create Default API Key
    await storage.createApiKey({
      key: "sk_live_1234567890abcdef",
      owner: "System Admin",
      status: "active",
      usageLimit: 10000
    });
    
    console.log("Seeding complete!");
  }
}
