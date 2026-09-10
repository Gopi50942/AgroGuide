import type { FertilizerStockPoint, FertilizerMovement } from "@/types";

// ─────────────────────────────────────────────
// Phase 129: Fertilizer Supply & Rake Movement Tracker Service
// District buffer stock tracking, buffer monitoring, and rake dispatch schedules.
// ─────────────────────────────────────────────

let inMemoryStocks: FertilizerStockPoint[] = [
  {
    id: "fert_stk_cbe_01",
    district: "Coimbatore",
    warehouseName: "Coimbatore Central Buffer Warehouse (TANFED)",
    fertilizerType: "Urea",
    openingStockTonnes: 1200,
    receivedTonnes: 800,
    distributedTonnes: 650,
    closingStockTonnes: 1350,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fert_stk_cbe_02",
    district: "Coimbatore",
    warehouseName: "Coimbatore Central Buffer Warehouse (TANFED)",
    fertilizerType: "DAP",
    openingStockTonnes: 450,
    receivedTonnes: 300,
    distributedTonnes: 380,
    closingStockTonnes: 370,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "fert_stk_tnj_01",
    district: "Thanjavur",
    warehouseName: "Kumbakonam Agro Service Center Depot",
    fertilizerType: "Urea",
    openingStockTonnes: 2400,
    receivedTonnes: 1200,
    distributedTonnes: 1500,
    closingStockTonnes: 2100,
    updatedAt: new Date().toISOString(),
  },
];

let inMemoryMovements: FertilizerMovement[] = [
  {
    id: "rake_mov_01",
    rakeNumber: "RAKE-SR-2026-8812",
    source: "SPIC Tuticorin Plant",
    destinationDistrict: "Coimbatore",
    fertilizerType: "Urea",
    quantityTonnes: 2600,
    dispatchDate: new Date(Date.now() - 2 * 86400000).toISOString().split("T")[0],
    expectedArrivalDate: new Date(Date.now() + 1 * 86400000).toISOString().split("T")[0],
    status: "In Transit",
  },
];

export async function listFertilizerStockPoints(districtFilter?: string): Promise<FertilizerStockPoint[]> {
  if (!districtFilter || districtFilter === "ALL") return inMemoryStocks;
  return inMemoryStocks.filter((s) => s.district.toLowerCase() === districtFilter.toLowerCase());
}

export async function listFertilizerMovements(districtFilter?: string): Promise<FertilizerMovement[]> {
  if (!districtFilter || districtFilter === "ALL") return inMemoryMovements;
  return inMemoryMovements.filter((m) => m.destinationDistrict.toLowerCase() === districtFilter.toLowerCase());
}
