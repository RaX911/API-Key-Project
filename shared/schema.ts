import { pgTable, text, serial, integer, boolean, timestamp, varchar, doublePrecision, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import * as auth from "./models/auth";

// Export auth models so they are picked up by drizzle
export * from "./models/auth";

// === REGIONAL DATA ===
export const islands = pgTable("islands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  altName: text("alt_name"),
  code: text("code").unique(), // e.g., "JAVA", "SUMATRA"
  lat: doublePrecision("lat"),
  long: doublePrecision("long"),
});

export const provinces = pgTable("provinces", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  islandId: integer("island_id").references(() => islands.id),
  capital: text("capital"),
});

export const regencies = pgTable("regencies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provinceId: integer("province_id").references(() => provinces.id),
  type: text("type").notNull(), // 'KABUPATEN' or 'KOTA'
});

export const districts = pgTable("districts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  regencyId: integer("regency_id").references(() => regencies.id),
});

export const villages = pgTable("villages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  districtId: integer("district_id").references(() => districts.id),
  postalCode: text("postal_code"),
});

// === TELECOM DATA ===
export const btsTowers = pgTable("bts_towers", {
  id: serial("id").primaryKey(),
  cellId: text("cell_id").notNull(),
  lac: text("lac").notNull(),
  mcc: text("mcc").notNull(),
  mnc: text("mnc").notNull(),
  lat: doublePrecision("lat").notNull(),
  long: doublePrecision("long").notNull(),
  address: text("address"),
  villageId: integer("village_id").references(() => villages.id),
  operator: text("operator").notNull(), // Telkomsel, Indosat, etc.
  networkType: text("network_type").notNull(), // 2G, 3G, 4G, 5G
  height: integer("height"), // in meters
  coverageRadius: integer("coverage_radius"), // in meters
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const msisdnData = pgTable("msisdn_data", {
  id: serial("id").primaryKey(),
  msisdn: text("msisdn").notNull().unique(), // Phone number
  imsi: text("imsi").notNull(),
  imei: text("imei").notNull(),
  iccid: text("iccid"),
  provider: text("provider").notNull(),
  status: text("status").default("active"), // active, inactive, suspended
  registeredName: text("registered_name"), // Simulated KYC data
  registeredNik: text("registered_nik"),
  lastBtsId: integer("last_bts_id").references(() => btsTowers.id),
  lastActive: timestamp("last_active").defaultNow(),
});

// === API MANAGEMENT ===
export const apiKeys = pgTable("api_keys", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  owner: text("owner").notNull(), // Name or System Name
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
  status: text("status").default("active"), // active, revoked
  usageLimit: integer("usage_limit").default(1000),
  usageCount: integer("usage_count").default(0),
  permissions: jsonb("permissions").default(["read"]), // ["read", "write", "admin"]
});

// === RELATIONS ===
export const provincesRelations = relations(provinces, ({ one, many }) => ({
  island: one(islands, {
    fields: [provinces.islandId],
    references: [islands.id],
  }),
  regencies: many(regencies),
}));

export const regenciesRelations = relations(regencies, ({ one, many }) => ({
  province: one(provinces, {
    fields: [regencies.provinceId],
    references: [provinces.id],
  }),
  districts: many(districts),
}));

export const districtsRelations = relations(districts, ({ one, many }) => ({
  regency: one(regencies, {
    fields: [districts.regencyId],
    references: [regencies.id],
  }),
  villages: many(villages),
}));

export const villagesRelations = relations(villages, ({ one, many }) => ({
  district: one(districts, {
    fields: [villages.districtId],
    references: [districts.id],
  }),
  btsTowers: many(btsTowers),
}));

export const btsTowersRelations = relations(btsTowers, ({ one, many }) => ({
  village: one(villages, {
    fields: [btsTowers.villageId],
    references: [villages.id],
  }),
  connectedMsisdns: many(msisdnData),
}));

export const msisdnDataRelations = relations(msisdnData, ({ one }) => ({
  lastBts: one(btsTowers, {
    fields: [msisdnData.lastBtsId],
    references: [btsTowers.id],
  }),
}));

// === INSERT SCHEMAS ===
export const insertIslandSchema = createInsertSchema(islands).omit({ id: true });
export const insertProvinceSchema = createInsertSchema(provinces).omit({ id: true });
export const insertRegencySchema = createInsertSchema(regencies).omit({ id: true });
export const insertDistrictSchema = createInsertSchema(districts).omit({ id: true });
export const insertVillageSchema = createInsertSchema(villages).omit({ id: true });
export const insertBtsTowerSchema = createInsertSchema(btsTowers).omit({ id: true, updatedAt: true });
export const insertMsisdnSchema = createInsertSchema(msisdnData).omit({ id: true, lastActive: true });
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({ id: true, createdAt: true, usageCount: true });

// === EXPORT TYPES ===
export type Island = typeof islands.$inferSelect;
export type Province = typeof provinces.$inferSelect;
export type Regency = typeof regencies.$inferSelect;
export type District = typeof districts.$inferSelect;
export type Village = typeof villages.$inferSelect;
export type BtsTower = typeof btsTowers.$inferSelect;
export type MsisdnRecord = typeof msisdnData.$inferSelect;
export type ApiKey = typeof apiKeys.$inferSelect;

export type InsertIsland = z.infer<typeof insertIslandSchema>;
export type InsertProvince = z.infer<typeof insertProvinceSchema>;
export type InsertRegency = z.infer<typeof insertRegencySchema>;
export type InsertDistrict = z.infer<typeof insertDistrictSchema>;
export type InsertVillage = z.infer<typeof insertVillageSchema>;
export type InsertBtsTower = z.infer<typeof insertBtsTowerSchema>;
export type InsertMsisdn = z.infer<typeof insertMsisdnSchema>;
export type InsertApiKey = z.infer<typeof insertApiKeySchema>;

// Complex Response Types
export type MsisdnLookupResponse = MsisdnRecord & {
  location: {
    lat: number;
    long: number;
    address: string | null;
    towerInfo: {
      cellId: string;
      lac: string;
      mcc: string;
      mnc: string;
      operator: string;
    } | null;
  } | null;
  region: {
    village: string | null;
    district: string | null;
    regency: string | null;
    province: string | null;
  } | null;
};
