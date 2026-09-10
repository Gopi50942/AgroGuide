import type {
  Crop,
  Expense,
  HarvestRecord,
  ProduceSale,
  IrrigationLog,
  DiseaseReport,
  CropTask,
  SeasonPerformanceReport,
} from "@/types";

// ─────────────────────────────────────────────
// Phase 75: Season-End Farm Performance Report Generator
// Compiles full agronomic and financial metrics for a concluded crop season.
// ─────────────────────────────────────────────

export function generateSeasonPerformanceReport(params: {
  crop: Crop;
  farmName: string;
  season: string;
  durationDays: number;
  expenses: Expense[];
  harvests: HarvestRecord[];
  sales: ProduceSale[];
  irrigationLogs: IrrigationLog[];
  diseaseReports: DiseaseReport[];
  tasks: CropTask[];
}): SeasonPerformanceReport {
  const totalExpensesRs = params.expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalSalesRevenueRs = params.sales.reduce((sum, s) => sum + (s.totalAmount || s.grossAmount || s.netRealization || 0), 0);
  const netProfitRs = totalSalesRevenueRs - totalExpensesRs;
  const roiPercent =
    totalExpensesRs > 0
      ? Math.round(((totalSalesRevenueRs - totalExpensesRs) / totalExpensesRs) * 100)
      : 0;

  const totalYieldQuantity = params.harvests.reduce((sum, h) => sum + h.quantity, 0);
  const yieldUnit = params.harvests[0]?.unit || "Quintal";

  const totalIrrigationLitres = params.irrigationLogs.reduce(
    (sum, log) => sum + (log.durationMinutes * 50), // Approx flow
    0
  );

  const completedTasks = params.tasks.filter((t) => t.completed).length;
  const tasksCompletionRatePercent =
    params.tasks.length > 0
      ? Math.round((completedTasks / params.tasks.length) * 100)
      : 100;

  return {
    cropName: params.crop.name,
    farmName: params.farmName,
    season: params.season,
    durationDays: params.durationDays,
    areaAcres: params.crop.areaAcres || 2.5,
    totalExpensesRs,
    totalYieldQuantity,
    yieldUnit,
    totalSalesRevenueRs,
    netProfitRs,
    roiPercent,
    totalIrrigationLitres,
    diseaseIncidentsCount: params.diseaseReports.length,
    tasksCompletionRatePercent,
    disclaimer:
      "Educational crop performance summary compiled from farmer-recorded logs — not an official financial audit or tax certificate.",
  };
}
