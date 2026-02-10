import { 
  apiKeys, btsTowers, msisdnData, 
  islands, provinces, regencies, districts, villages,
  type InsertApiKey, type InsertBtsTower, type InsertMsisdn,
  type ApiKey, type BtsTower, type MsisdnRecord, type MsisdnLookupResponse,
  type InsertIsland, type InsertProvince, type InsertRegency, type InsertDistrict, type InsertVillage
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, like } from "drizzle-orm";

export interface IStorage {
  // API Keys
  getApiKeys(): Promise<ApiKey[]>;
  createApiKey(key: InsertApiKey): Promise<ApiKey>;
  revokeApiKey(id: number): Promise<ApiKey | undefined>;
  getApiKey(key: string): Promise<ApiKey | undefined>;
  incrementApiKeyUsage(id: number): Promise<void>;

  // BTS Towers
  getBtsTowers(params?: { search?: string; operator?: string; limit?: number; offset?: number }): Promise<{ items: BtsTower[]; total: number }>;
  getBtsTower(id: number): Promise<BtsTower | undefined>;
  createBtsTower(tower: InsertBtsTower): Promise<BtsTower>;
  updateBtsTower(id: number, tower: Partial<InsertBtsTower>): Promise<BtsTower | undefined>;
  deleteBtsTower(id: number): Promise<void>;

  // MSISDN
  getMsisdn(msisdn: string): Promise<MsisdnRecord | undefined>;
  lookupMsisdnDetails(msisdn: string): Promise<MsisdnLookupResponse | undefined>;
  listMsisdns(params?: { search?: string; limit?: number; offset?: number }): Promise<{ items: MsisdnRecord[]; total: number }>;
  createMsisdn(record: InsertMsisdn): Promise<MsisdnRecord>;

  // Regional (Simplified for MVP)
  getIslands(): Promise<any[]>;
  createIsland(island: InsertIsland): Promise<any>;
  createProvince(province: InsertProvince): Promise<any>;
  
  // Dashboard
  getStats(): Promise<{ totalBts: number; totalMsisdn: number; activeKeys: number; regionsCovered: number }>;
}

export class DatabaseStorage implements IStorage {
  // === API KEYS ===
  async getApiKeys(): Promise<ApiKey[]> {
    return await db.select().from(apiKeys).orderBy(desc(apiKeys.createdAt));
  }

  async createApiKey(key: InsertApiKey): Promise<ApiKey> {
    const [newKey] = await db.insert(apiKeys).values(key).returning();
    return newKey;
  }

  async revokeApiKey(id: number): Promise<ApiKey | undefined> {
    const [key] = await db
      .update(apiKeys)
      .set({ status: 'revoked' })
      .where(eq(apiKeys.id, id))
      .returning();
    return key;
  }

  async getApiKey(key: string): Promise<ApiKey | undefined> {
    const [record] = await db.select().from(apiKeys).where(eq(apiKeys.key, key));
    return record;
  }

  async incrementApiKeyUsage(id: number): Promise<void> {
    await db
      .update(apiKeys)
      .set({ usageCount: sql`${apiKeys.usageCount} + 1` })
      .where(eq(apiKeys.id, id));
  }

  // === BTS TOWERS ===
  async getBtsTowers(params?: { search?: string; operator?: string; limit?: number; offset?: number }): Promise<{ items: BtsTower[]; total: number }> {
    let query = db.select().from(btsTowers);
    let countQuery = db.select({ count: sql<number>`count(*)` }).from(btsTowers);

    const conditions = [];
    if (params?.search) {
      conditions.push(sql`${btsTowers.address} ILIKE ${`%${params.search}%`}`);
    }
    if (params?.operator) {
      conditions.push(eq(btsTowers.operator, params.operator));
    }

    if (conditions.length > 0) {
      // @ts-ignore
      query.where(sql.join(conditions, sql` AND `));
      // @ts-ignore
      countQuery.where(sql.join(conditions, sql` AND `));
    }

    const total = (await countQuery)[0].count;
    
    if (params?.limit) query.limit(params.limit);
    if (params?.offset) query.offset(params.offset);

    const items = await query.orderBy(desc(btsTowers.updatedAt));
    return { items, total };
  }

  async getBtsTower(id: number): Promise<BtsTower | undefined> {
    const [tower] = await db.select().from(btsTowers).where(eq(btsTowers.id, id));
    return tower;
  }

  async createBtsTower(tower: InsertBtsTower): Promise<BtsTower> {
    const [newTower] = await db.insert(btsTowers).values(tower).returning();
    return newTower;
  }

  async updateBtsTower(id: number, updates: Partial<InsertBtsTower>): Promise<BtsTower | undefined> {
    const [updated] = await db
      .update(btsTowers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(btsTowers.id, id))
      .returning();
    return updated;
  }

  async deleteBtsTower(id: number): Promise<void> {
    await db.delete(btsTowers).where(eq(btsTowers.id, id));
  }

  // === MSISDN ===
  async getMsisdn(msisdn: string): Promise<MsisdnRecord | undefined> {
    const [record] = await db.select().from(msisdnData).where(eq(msisdnData.msisdn, msisdn));
    return record;
  }

  async lookupMsisdnDetails(msisdn: string): Promise<MsisdnLookupResponse | undefined> {
    // Perform a join to get tower and regional info
    const result = await db
      .select({
        msisdn: msisdnData,
        tower: btsTowers,
        village: villages,
        district: districts,
        regency: regencies,
        province: provinces,
      })
      .from(msisdnData)
      .leftJoin(btsTowers, eq(msisdnData.lastBtsId, btsTowers.id))
      .leftJoin(villages, eq(btsTowers.villageId, villages.id))
      .leftJoin(districts, eq(villages.districtId, districts.id))
      .leftJoin(regencies, eq(districts.regencyId, regencies.id))
      .leftJoin(provinces, eq(regencies.provinceId, provinces.id))
      .where(eq(msisdnData.msisdn, msisdn));

    if (result.length === 0) return undefined;

    const row = result[0];
    
    // Construct the complex response
    return {
      ...row.msisdn,
      location: row.tower ? {
        lat: row.tower.lat,
        long: row.tower.long,
        address: row.tower.address,
        towerInfo: {
          cellId: row.tower.cellId,
          lac: row.tower.lac,
          mcc: row.tower.mcc,
          mnc: row.tower.mnc,
          operator: row.tower.operator,
        }
      } : null,
      region: {
        village: row.village?.name || null,
        district: row.district?.name || null,
        regency: row.regency?.name || null,
        province: row.province?.name || null,
      }
    };
  }

  async listMsisdns(params?: { search?: string; limit?: number; offset?: number }): Promise<{ items: MsisdnRecord[]; total: number }> {
    let query = db.select().from(msisdnData);
    if (params?.search) {
      query.where(like(msisdnData.msisdn, `%${params.search}%`));
    }
    const items = await query.limit(params?.limit || 50).offset(params?.offset || 0);
    // Rough count for performance in lite mode
    const total = (await db.select({ count: sql<number>`count(*)` }).from(msisdnData))[0].count;
    return { items, total };
  }

  async createMsisdn(record: InsertMsisdn): Promise<MsisdnRecord> {
    const [newRecord] = await db.insert(msisdnData).values(record).returning();
    return newRecord;
  }

  // === REGIONAL ===
  async getIslands(): Promise<any[]> {
    return await db.select().from(islands);
  }

  async createIsland(island: InsertIsland): Promise<any> {
    const [newIsland] = await db.insert(islands).values(island).returning();
    return newIsland;
  }

  async createProvince(province: InsertProvince): Promise<any> {
    const [newProvince] = await db.insert(provinces).values(province).returning();
    return newProvince;
  }

  // === STATS ===
  async getStats() {
    const [bts] = await db.select({ count: sql<number>`count(*)` }).from(btsTowers);
    const [msisdn] = await db.select({ count: sql<number>`count(*)` }).from(msisdnData);
    const [keys] = await db.select({ count: sql<number>`count(*)` }).from(apiKeys).where(eq(apiKeys.status, 'active'));
    const [regions] = await db.select({ count: sql<number>`count(*)` }).from(provinces);

    return {
      totalBts: Number(bts.count),
      totalMsisdn: Number(msisdn.count),
      activeKeys: Number(keys.count),
      regionsCovered: Number(regions.count),
    };
  }
}

export const storage = new DatabaseStorage();
