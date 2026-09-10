import type { WarehouseCapacityIntelligence } from "@/types";

// ─────────────────────────────────────────────
// Phase 156: Agricultural Warehouse Capacity Intelligence Service
// Space availability, utilization %, and cold room capacities.
// ─────────────────────────────────────────────

const MOCK_WAREHOUSES: WarehouseCapacityIntelligence[] = [
  {
    warehouseId: "wh_cbe_tanfed_01",
    warehouseName: "Coimbatore Central Agricultural Buffer Warehouse",
    district: "Coimbatore",
    totalCapacityTonnes: 5000,
    usedCapacityTonnes: 3850,
    availableCapacityTonnes: 1150,
    utilizationPercent: 77.0,
    coldStorageAvailable: true,
    lastUpdated: new Date().toISOString(),
    freshness: "LIVE",
  },
  {
    warehouseId: "wh_pollachi_reg_02",
    warehouseName: "Pollachi Regulated Market Warehouse Yard",
    district: "Coimbatore",
    totalCapacityTonnes: 2500,
    usedCapacityTonnes: 1600,
    availableCapacityTonnes: 900,
    utilizationPercent: 64.0,
    coldStorageAvailable: false,
    lastUpdated: new Date().toISOString(),
    freshness: "RECENT",
  },
  {
    warehouseId: "wh_tnj_cwc_01",
    warehouseName: "Central Warehousing Corporation Kumbakonam Depot",
    district: "Thanjavur",
    totalCapacityTonnes: 12000,
    usedCapacityTonnes: 10400,
    availableCapacityTonnes: 1600,
    utilizationPercent: 86.6,
    coldStorageAvailable: false,
    lastUpdated: new Date().toISOString(),
    freshness: "LIVE",
  },
];

export async function listWarehouseCapacities(district?: string): Promise<WarehouseCapacityIntelligence[]> {
  if (!district || district === "ALL") return MOCK_WAREHOUSES;
  return MOCK_WAREHOUSES.filter((w) => w.district.toLowerCase() === district.toLowerCase());
}
