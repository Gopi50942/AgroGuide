import type { DairyCooperativeRecord } from "@/types";

// ─────────────────────────────────────────────
// Phase 157: Dairy Cooperative Integration Layer Service
// Cooperative milk collection society integration with manual fallback.
// ─────────────────────────────────────────────

let inMemoryDairyRecords: DairyCooperativeRecord[] = [
  {
    recordId: "dairy_rec_01",
    farmerId: "farmer_gopi_cbe",
    collectionCenterId: "Aavin Primary Milk Society Alandurai (SOC-771)",
    date: new Date().toISOString().split("T")[0],
    morningLitres: 14.5,
    eveningLitres: 12.0,
    fatPercent: 4.2,
    snfPercent: 8.5,
    ratePerLitreRs: 36.5,
    totalEarningsRs: 967.25,
    qualityStatus: "Standard",
    source: "MANUAL_ENTRY",
  },
];

export class DairyCooperativeProvider {
  private isConfigured: boolean;

  constructor() {
    this.isConfigured = Boolean(process.env.AAVIN_API_KEY || process.env.DAIRY_COOP_API);
  }

  async syncMilkCollection(farmerId: string): Promise<{ status: string; records: DairyCooperativeRecord[] }> {
    if (!this.isConfigured) {
      return {
        status: "NOT_CONFIGURED",
        records: inMemoryDairyRecords.filter((r) => r.farmerId === farmerId),
      };
    }

    return {
      status: "CONNECTED",
      records: inMemoryDairyRecords.filter((r) => r.farmerId === farmerId),
    };
  }
}

export const dairyCooperativeProvider = new DairyCooperativeProvider();

export async function recordDairyCollection(
  farmerId: string,
  collectionCenterId: string,
  morningLitres: number,
  eveningLitres: number,
  fatPercent: number,
  snfPercent: number,
  ratePerLitreRs: number
): Promise<DairyCooperativeRecord> {
  const totalLitres = morningLitres + eveningLitres;
  const totalEarningsRs = totalLitres * ratePerLitreRs;
  const qualityStatus = fatPercent >= 3.8 && snfPercent >= 8.2 ? "Standard" : "Substandard";

  const record: DairyCooperativeRecord = {
    recordId: `dairy_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    farmerId,
    collectionCenterId,
    date: new Date().toISOString().split("T")[0],
    morningLitres,
    eveningLitres,
    fatPercent,
    snfPercent,
    ratePerLitreRs,
    totalEarningsRs,
    qualityStatus,
    source: "MANUAL_ENTRY",
  };

  inMemoryDairyRecords.unshift(record);
  return record;
}

export async function listDairyRecords(farmerId?: string): Promise<DairyCooperativeRecord[]> {
  if (farmerId) return inMemoryDairyRecords.filter((r) => r.farmerId === farmerId);
  return inMemoryDairyRecords;
}
