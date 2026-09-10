import type { CropCuttingExperiment } from "@/types";

// ─────────────────────────────────────────────
// Phase 125: Crop Cutting Experiment (CCE) Digital Ledger Service
// Statistical sampling calculations and field experiment lifecycle.
// ─────────────────────────────────────────────

export function calculateNormalizedYield(
  harvestWeightKg: number,
  sampleAreaSqMeters: number = 25, // default 5m x 5m standard plot
  moisturePercent: number = 14,
  standardMoisture: number = 14
): { yieldKgPerHa: number; yieldQuintalPerHa: number } {
  if (sampleAreaSqMeters <= 0) {
    return { yieldKgPerHa: 0, yieldQuintalPerHa: 0 };
  }

  // Multiplier to convert sample area to 1 Hectare (10,000 sq.m)
  const areaMultiplier = 10000 / sampleAreaSqMeters;
  const rawYieldKgPerHa = harvestWeightKg * areaMultiplier;

  // Moisture correction factor
  const moistureFactor = (100 - moisturePercent) / (100 - standardMoisture);
  const normalizedKgPerHa = Math.round(rawYieldKgPerHa * moistureFactor);
  const normalizedQuintalPerHa = Math.round((normalizedKgPerHa / 100) * 10) / 10;

  return {
    yieldKgPerHa: normalizedKgPerHa,
    yieldQuintalPerHa: normalizedQuintalPerHa,
  };
}

let inMemoryCceRecords: CropCuttingExperiment[] = [
  {
    id: "cce_demo_1",
    experimentId: "CCE-CBE-2026-001",
    district: "Coimbatore",
    block: "Thondamuthur",
    village: "Alandurai",
    farmId: "farm_cbe_main",
    farmerName: "Gopi S",
    crop: "Hybrid Tomato (Shivam)",
    season: "Kharif 2026",
    plotAreaSqMeters: 4000,
    sampleAreaSqMeters: 25, // 5m x 5m
    harvestWeightKg: 42.5,
    moisturePercent: 14,
    normalizedYieldKgPerHa: 17000,
    normalizedYieldQuintalPerHa: 170.0,
    officerId: "officer_muthu_cbe",
    officerName: "Muthukumar (Extension Officer)",
    inspectionDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    gpsLocation: { lat: 10.957, lng: 76.848 },
    status: "Verified",
  },
  {
    id: "cce_demo_2",
    experimentId: "CCE-TNJ-2026-002",
    district: "Thanjavur",
    block: "Kumbakonam",
    village: "Swamimalai",
    farmId: "farm_tnj_paddy",
    farmerName: "Ramasamy V",
    crop: "Samba Paddy (CR 1009)",
    season: "Samba 2026",
    plotAreaSqMeters: 6000,
    sampleAreaSqMeters: 25,
    harvestWeightKg: 13.2,
    moisturePercent: 14,
    normalizedYieldKgPerHa: 5280,
    normalizedYieldQuintalPerHa: 52.8,
    officerId: "officer_delta_01",
    officerName: "Karthik (Block Officer)",
    inspectionDate: new Date(Date.now() - 7 * 86400000).toISOString(),
    gpsLocation: { lat: 10.959, lng: 79.324 },
    status: "Submitted",
  },
];

export async function recordCropCuttingExperiment(
  district: string,
  block: string,
  village: string,
  farmId: string,
  farmerName: string,
  crop: string,
  season: string,
  sampleAreaSqMeters: number,
  harvestWeightKg: number,
  moisturePercent: number,
  officerId: string,
  officerName: string,
  gpsLocation: { lat: number; lng: number },
  photoEvidenceUrls?: string[]
): Promise<CropCuttingExperiment> {
  const yields = calculateNormalizedYield(harvestWeightKg, sampleAreaSqMeters, moisturePercent);

  const exp: CropCuttingExperiment = {
    id: `cce_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    experimentId: `CCE-${district.slice(0, 3).toUpperCase()}-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    district,
    block,
    village,
    farmId,
    farmerName,
    crop,
    season,
    plotAreaSqMeters: 4000,
    sampleAreaSqMeters,
    harvestWeightKg,
    moisturePercent,
    normalizedYieldKgPerHa: yields.yieldKgPerHa,
    normalizedYieldQuintalPerHa: yields.yieldQuintalPerHa,
    officerId,
    officerName,
    inspectionDate: new Date().toISOString(),
    gpsLocation,
    status: "Collected",
    photoEvidenceUrls,
  };

  inMemoryCceRecords.unshift(exp);
  return exp;
}

export async function listCropCuttingExperiments(districtFilter?: string): Promise<CropCuttingExperiment[]> {
  if (!districtFilter || districtFilter === "ALL") return inMemoryCceRecords;
  return inMemoryCceRecords.filter((c) => c.district.toLowerCase() === districtFilter.toLowerCase());
}

export async function updateCceStatus(
  experimentId: string,
  status: CropCuttingExperiment["status"]
): Promise<CropCuttingExperiment | null> {
  const item = inMemoryCceRecords.find((c) => c.id === experimentId || c.experimentId === experimentId);
  if (!item) return null;
  item.status = status;
  return item;
}
