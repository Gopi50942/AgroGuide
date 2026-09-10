import type { Farm, Crop, HarvestRecord, ProduceSale, Expense } from "@/types";

// ─────────────────────────────────────────────
// Phase 76: Multi-Farm Comparison Analytics Engine
// Compares yield, profit per acre, and input costs between different cultivation units.
// ─────────────────────────────────────────────

export interface FarmComparisonMetrics {
  farmId: string;
  farmName: string;
  areaAcres: number;
  totalYield: number;
  yieldPerAcre: number;
  totalExpensesRs: number;
  totalRevenueRs: number;
  netProfitRs: number;
  profitPerAcreRs: number;
}

export function compareFarmsPerformance(params: {
  farms: Farm[];
  crops: Crop[];
  harvests: HarvestRecord[];
  sales: ProduceSale[];
  expenses: Expense[];
}): FarmComparisonMetrics[] {
  return params.farms.map((farm) => {
    const acres = farm.areaAcres || farm.totalAreaAcres || farm.acres || 1;
    const farmCropIds = new Set(params.crops.filter((c) => c.farmId === farm.id).map((c) => c.id));

    const farmHarvests = params.harvests.filter((h) => (Boolean(h.cropId) && farmCropIds.has(h.cropId!)) || h.farmId === farm.id);
    const totalYield = farmHarvests.reduce((sum, h) => sum + h.quantity, 0);

    const farmSales = params.sales.filter((s) => (Boolean(s.cropId) && farmCropIds.has(s.cropId!)) || s.farmId === farm.id);
    const totalRevenueRs = farmSales.reduce((sum, s) => sum + (s.totalAmount || s.grossAmount || s.netRealization || 0), 0);

    const farmExpenses = params.expenses.filter((e) => e.farmId === farm.id);
    const totalExpensesRs = farmExpenses.reduce((sum, e) => sum + e.amount, 0);

    const netProfitRs = totalRevenueRs - totalExpensesRs;
    const yieldPerAcre = Math.round((totalYield / acres) * 10) / 10;
    const profitPerAcreRs = Math.round(netProfitRs / acres);

    return {
      farmId: farm.id,
      farmName: farm.name,
      areaAcres: acres,
      totalYield,
      yieldPerAcre,
      totalExpensesRs,
      totalRevenueRs,
      netProfitRs,
      profitPerAcreRs,
    };
  });
}
