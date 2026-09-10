import type { FarmerPassbookData } from "@/types";

// ─────────────────────────────────────────────
// Phase 172: Farmer Unified Agriculture Passbook Service
// Unified agricultural ledger aggregating crops, soil health, finances, and government services.
// ─────────────────────────────────────────────

export async function getFarmerPassbookData(farmerId: string = "farmer_gopi_cbe"): Promise<FarmerPassbookData> {
  return {
    farmerId,
    farmerName: "Gopi S",
    village: "Alandurai",
    district: "Coimbatore",
    activeFarmsCount: 2,
    totalAcres: 4.5,
    activeCrops: ["Hybrid Tomato (Shivam)", "Small Onion (CO 6)", "Maize"],
    soilReportsCount: 3,
    tasksCompletedCount: 48,
    totalExpensesRs: 84500,
    totalHarvestQuintals: 165,
    totalSalesRevenueRs: 242000,
    schemesEnrolledCount: 3,
    trainingAttendedCount: 2,
    lastUpdated: new Date().toISOString(),
  };
}
